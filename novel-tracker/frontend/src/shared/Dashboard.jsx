import { useQuery } from "@tanstack/react-query";
import StatsRoll from "../components/dashboard/StatsRoll";
import LottieAnimation from "./LottiePlayer";
import ErrorPage from "./ErrorPage";
import axiosInstance from "../utils/axiosInstance";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { getSessionData } from "../utils/localStorageService";

// Default stats
const defaultStats = [
  "👋 Welcome to your dashboard",
  "📖 You have no reading stats yet",
  "📝 Add books and track your reading progress",
  "🏆 Enjoy novel tracker",
];

// Default quote
const defaultQuote =
  "The journey of learning is never-ending, and with every new discovery, we unlock another layer of potential. Welcome to a space where curiosity meets growth, and every step forward brings us closer to our dreams. May you find inspiration and joy as you explore new horizons.";

// API call to fetch reading stats
const getReadingStats = async () => {
  const response = await axiosInstance.get("/api/stats/all");
  return response.data;
};

// API call to fetch quote
const fetchQuote = async () => {
  const response = await axiosInstance.get("/api/quote/get");
  return response.data;
};

const Dashboard = () => {
  const [readingStats, setReadingStats] = useState(defaultStats);
  const [quote, setQuote] = useState(defaultQuote);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: getReadingStats,
    keepPreviousData: true,
  });

  const { data: quoteData, isError: isQuoteError } = useQuery({
    queryKey: ["quote"],
    queryFn: fetchQuote,
    keepPreviousData: true,
    retry: false,
  });

  useEffect(() => {
    // Update readingStats if data is available
    if (data) {
      const newStats = [
        "👋 Welcome to your dashboard",
        `📚 Total Books: ${data.totalBooks || 0}`,
        `📖 Total Books Read: ${data.booksRead || 0}`,
        `📜 Total Pages Read: ${data.totalPagesRead || 0}`,
      ];
      setReadingStats(newStats);
    }
  }, [data]);

  useEffect(() => {
    if (quoteData) {
      setQuote(quoteData?.quote);
    }
  }, [isQuoteError, quoteData]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    console.error(error);
    return (
      <ErrorPage
        description={
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong! Please try again later."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <main className="w-full flex flex-col items-center justify-between">
      {/* Display stats */}
      <StatsRoll stats={readingStats} />
      <section className="w-full md:h-[75vh] md:border-b-2 border-solid flex flex-col md:flex-row items-center justify-center text-dark dark:text-light">
        <div className="inline-block md:w-1/2 h-full border-r-0 md:border-r-2 border-solid">
          <LottieAnimation
            animation="/bouncing.lottie"
            width="420px"
            height="420px"
          />
        </div>

        <div className="md:w-1/2 flex flex-col items-start justify-center px-8 md:px-16 pb-4 md:pb-8 border-t-2 md:border-t-0 border-solid pt-4 md:pt-0">
          <ul className="list-disc pl-4 mb-2">
            <li>📚 Total Books: {data.totalBooks || 0}</li>
            <li>📖 Total Books Read: {data.booksRead || 0}</li>
            <li>📜 Total Pages Read: {data.totalPagesRead || 0}</li>
          </ul>
          <h2 className="font-bold capitalize text-2xl md:text-3xl lg:text-4xl">
            Hello there,
          </h2>
          <TypeAnimation
            sequence={[quote, 2000]}
            speed={50}
            wrapper="p"
            repeat={0}
          />
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
