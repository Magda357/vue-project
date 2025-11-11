class StockService {
    constructor() {
        this.apiClient = axios.create({
            baseURL: 'https://sheetdb.io/api/v1/8qaot0bu6vekv'
        });
    }

    async fetchData(sheetName) {
        try {
            const response = await this.apiClient.get(`?sheet=${sheetName}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    async getRevenue(sheetName) {
        const data = await this.fetchData(sheetName)
        return order.map(key => data[3][key]);
    }
}

export const stockService = new StockService();