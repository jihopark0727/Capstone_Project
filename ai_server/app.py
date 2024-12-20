import os
from flask import Flask, request, jsonify
from ClovaSpeech import ClovaSpeechClient
from openai import OpenAI
import logging

app = Flask(__name__)

# Clova Speech와 OpenAI 초기화
invoke_url = ""
secret = ""
clova_client = ClovaSpeechClient(invoke_url, secret)

# OpenAI Client 초기화
client = OpenAI(api_key="")

app.logger.info("Clova Speech and OpenAI initialized.")

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    file_path = f"temp/{file.filename}"
    file.save(file_path)

    # Clova Speech 호출
    response = clova_client.req_upload(file_path, completion='sync')
    app.logger.info("Clova Speech Response: %s", response.text)

    response_data = response.json()

    all_texts = []
    results = []

    sentence_id = 1
    for segment in response_data.get('segments', []):
        text = segment.get('text', '')
        speaker_label = segment.get('diarization', {}).get('label', '')

        all_texts.append({
            "id": sentence_id,
            "text": text,
            "speaker_label": int(speaker_label)
        })

        results.append({
            "id": str(sentence_id),
            "speaker_label": None,  # OpenAI API에서 상담사/내담자를 판단
            "text": text,
            "emotion": None,
            "keywords": None,
            "analysisSummary": None  # 상담 솔루션 추가를 위해 추가된 필드
        })
        sentence_id += 1

    # OpenAI API를 통해 speaker_label을 상담사(2)/내담자(1)로 판단
    speaker_labels = identify_speakers(all_texts)

    # 상담사/내담자 정보를 results에 매핑
    for i, label in enumerate(speaker_labels):
        results[i]["speaker_label"] = label

    # 내담자의 문장만 모아서 감정 분석 및 키워드 추출
    client_texts = [text["text"] for text, label in zip(all_texts, speaker_labels) if label == 1]
    if client_texts:
        predictions = analyze_client_texts(client_texts)

        prediction_idx = 0
        for result in results:
            if result["speaker_label"] == 1:
                result["emotion"] = predictions[prediction_idx]["emotion"]
                result["keywords"] = predictions[prediction_idx]["keywords"]
                prediction_idx += 1

    # 상담사 솔루션 추가
    try:
        dialogue_context = "\n".join([f"{item['text']}" for item in all_texts])
        counselor_solution, client_solution = _counseling_solutions(dialogue_context)
        results[-1]["analysisSummary"] = counselor_solution
        results[-2]["analysisSummary"] = client_solution
    except Exception as e:
        app.logger.error(f"솔루션 생성 중 오류 발생: {e}")
        results[-1]["analysisSummary"] = "솔루션 생성 중 오류가 발생했습니다."

    app.logger.info("Final Results: %s", results)
    return jsonify(results), 200


def identify_speakers(all_texts):
    """
    OpenAI API를 호출하여 speaker_label을 상담사(2) 또는 내담자(1)로 변환합니다.
    """
    dialogue_text = "\n".join([f"{i['id']}. {i['text']}" for i in all_texts])

    prompt = f"""
    아래는 상담 대화 내용입니다. 각 문장이 상담사(2) 또는 내담자(1) 중 누가 말한 것인지 판단해주세요.
    결과는 반드시 숫자만 포함된 형식으로 반환합니다.

    예시:
    1. "안녕하세요, 오늘은 어떤 문제로 오셨나요?" -> 2
    2. "요즘 스트레스가 많아서 힘들어요." -> 1

    대화 내용:
    {dialogue_text}

    결과 형식:
    1
    2
    ...
    """
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "당신은 대화 내용을 분석하는 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            model="gpt-4",
        )
        labels = response.choices[0].message.content.strip().split("\n")
        return [int(label) for label in labels]
    except Exception as e:
        app.logger.error(f"OpenAI API 호출 중 오류 발생: {e}")
        return [0] * len(all_texts)  # 오류 시 기본값으로 0 반환

def parse_openai_response(client_texts, response_text):
    """
    OpenAI의 응답 텍스트를 파싱하여 감정과 키워드 데이터를 정리합니다.
    """
    lines = response_text.strip().split("\n")
    predictions = []

    for i in range(len(client_texts)):
        try:
            # 감정 추출
            emotion_line = lines[i * 2] if i * 2 < len(lines) else "감정: 알 수 없음"
            emotion = emotion_line.split("감정:")[1].strip() if "감정:" in emotion_line else "알 수 없음"

            # 키워드 추출
            keywords_line = lines[i * 2 + 1] if i * 2 + 1 < len(lines) else "키워드: "
            keywords = (
                [kw.strip() for kw in keywords_line.split("키워드:")[1].strip().split(",")]
                if "키워드:" in keywords_line
                else []
            )
        except Exception as e:
            app.logger.error(f"응답 파싱 중 오류 발생: {e}")
            emotion = "알 수 없음"
            keywords = []

        predictions.append({"emotion": emotion, "keywords": keywords})

    return predictions


def analyze_client_texts(client_texts):
    """
    내담자의 문장을 분석하여 감정 및 키워드를 추출합니다.
    """
    client_dialogue_text = "\n".join([f"{i+1}. {text}" for i, text in enumerate(client_texts)])

    prompt = f"""
    아래는 내담자가 말한 문장들입니다. 각 문장에 대해 감정과 주요 키워드를 추출해 주세요.
    - 가능한 감정: 행복, 중립, 불안, 당황, 슬픔, 분노, 혐오 중 하나. 분석이 어렵다면 무조건 중립으로 반환. 빈칸으로 반환하지 말 것.
    - 키워드는 최대 5개, 키워드를 추출할 수 없다면 반드시 첫번째 단어 반환. 빈칸으로 반환하지 말 것.
    
    문장들:
    {client_dialogue_text}
    
    결과 형식:
    1. 감정: <감정>
       키워드: <키워드1>, <키워드2>, ...
    2. 감정: <감정>
       키워드: <키워드1>, <키워드2>, ...
    """
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "당신은 감정 분석 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            model="gpt-4",
        )
        response_text = response.choices[0].message.content
        app.logger.info(f"OpenAI 응답: {response_text}")

        # 후처리 적용
        return parse_openai_response(client_texts, response_text)

    except Exception as e:
        app.logger.error(f"OpenAI API 호출 중 오류 발생: {e}")
        return [{"emotion": "알 수 없음", "keywords": []} for _ in client_texts]



def _counseling_solutions(dialogue_context):
    """
    OpenAI API를 사용하여 상담사와 내담자를 위한 각각의 솔루션을 생성합니다.
    """
    counselor_prompt = f"""
    아래는 상담 대화 내용입니다. 상담 내용을 바탕으로 상담사가 내담자와 앞으로 상담을 진행할 때 적합한 전략과 접근 방식을 제안해주세요.
    작성 시 공백을 포함하여 한국어 기준으로 255자를 초과하지 않도록 작성해주세요.

    대화 내용:
    {dialogue_context}

    결과 형식:
    상담사 솔루션: <공백 포함 255자 이내의 솔루션>
    """

    client_prompt = f"""
    아래는 상담 대화 내용입니다. 상담 내용을 바탕으로 내담자가 스스로 문제를 극복하거나 현재 상황에서 도움을 받을 수 있는 구체적인 방법을 제안해주세요.
    작성 시 공백을 포함하여 한국어 기준으로 255자를 초과하지 않도록 작성해주세요.

    대화 내용:
    {dialogue_context}

    결과 형식:
    내담자 솔루션: <공백 포함 255자 이내의 솔루션>
    """

    try:
        counselor_response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "당신은 상담 전략을 제안하는 전문가입니다."},
                {"role": "user", "content": counselor_prompt}
            ],
            model="gpt-4",
        )
        client_response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "당신은 내담자를 위한 전략을 제안하는 전문가입니다."},
                {"role": "user", "content": client_prompt}
            ],
            model="gpt-4",
        )

        counselor_solution = counselor_response.choices[0].message.content.strip().replace("상담사 솔루션:", "").strip()
        client_solution = client_response.choices[0].message.content.strip().replace("내담자 솔루션:", "").strip()

        return counselor_solution, client_solution
    except Exception as e:
        app.logger.error(f"솔루션 생성 중 오류 발생: {e}")
        return "상담사 솔루션 생성 중 오류가 발생했습니다.", "내담자 솔루션 생성 중 오류가 발생했습니다."


if __name__ == '__main__':
    app.logger.setLevel(logging.INFO)
    app.run(host='0.0.0.0', port=5000)
