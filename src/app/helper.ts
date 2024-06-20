export function formatData(data: any) {
    const chartData = [];
    for (let date in data) {
        chartData.push([new Date(date).getTime(), parseFloat(data[date]['4. close'])]);
    }
    return chartData.sort((a, b) => a[0] - b[0]);
}

export function formatDate(inputDate: string): string {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}
