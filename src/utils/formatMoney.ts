// 숫자를 한국 원화 형식으로 포맷 (억 단위까지 숫자, 조 단위부터 축약, 최대 9999조)
export function formatMoney(amount: number): string {
    const rounded = Math.floor(amount);
    const maxValue = 9999 * 1000000000000; // 9999조
    const capped = Math.min(rounded, maxValue);

    if (capped >= 1000000000000) {
        // 조 단위 (1조 이상) - 억 단위도 함께 표시
        const jo = Math.floor(capped / 1000000000000);
        const eok = Math.floor((capped % 1000000000000) / 100000000);
        if (eok > 0) {
            return `${jo.toLocaleString()}조 ${eok}억`;
        }
        return `${jo.toLocaleString()}조`;
    }
    if (capped >= 100000000) {
        // 억 단위 (1억 이상)
        return `${Math.floor(capped / 100000000).toLocaleString()}억`;
    }
    if (capped >= 10000) {
        // 만 단위
        return `${(capped / 10000).toFixed(1)}만`;
    }
    return capped.toLocaleString();
}
