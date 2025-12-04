import { useEffect, useState } from "react";
import apiService from "../services/api";
import PersonProfile from "./PersonProfile";

const PersonProfileWrapper = () => {
  const [persons, setPersons] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [personsData, salesData] = await Promise.all([
          apiService.fetchPersons(),
          apiService.fetchSalesHistory(),
        ]);
        setPersons(personsData);
        setSales(salesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return <PersonProfile persons={persons} sales={sales} />;
};

export default PersonProfileWrapper;
