function formatDateToYYYYMMDD(date:Date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0'); // 날짜를 2자리로 변환

    return `${year}-${month}-${day}`;
}

export { formatDateToYYYYMMDD };
