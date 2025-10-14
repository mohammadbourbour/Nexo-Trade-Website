import { CryptoSentimentProDashboard } from "@/components/CryptoSentimentProDashboard";
import mockData from "@/mocks/sample_data.json";

const Index = () => {
  return <CryptoSentimentProDashboard data={mockData} />;
};

export default Index;
