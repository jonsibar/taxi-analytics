import Link from 'next/link';
import { useRouter } from 'next/router';
export default function Layout({ children }) {
  const router = useRouter();
  const isActive = (path) => router.pathname === path 
    ? "bg-cyan-900 text-cyan-400 border border-cyan-700" 
    : "text-gray-300 hover:bg-gray-800 hover:text-white";
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gray-900">
      {}
      <div className="w-[125%] h-[125%] origin-top-left transform scale-[0.8]">
        <div className="h-full bg-gray-900 text-gray-100 font-sans flex flex-col">
          {}
          <nav className="bg-gray-900 border-b border-gray-800 z-50 flex-none">
            <div className="px-6"> 
              {}
              <div className="flex flex-col md:flex-row items-center min-h-[4rem] py-3 md:py-0">
    <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
        {}
        <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">T</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Taxi<span className="text-cyan-400">Analytics</span></span>
        </div>
        {}
    </div>
                {}
                <div className="w-full md:w-auto mt-3 md:mt-0 md:ml-10"> 
        <div className="flex items-baseline justify-center md:justify-start space-x-4">
            <Link href="/" className={`px-4 py-2 rounded-md text-sm font-bold tracking-tight transition-all duration-200 ${isActive('/')}`}>
                Trip Explorer
            </Link>
            <Link href="/predict" className={`px-4 py-2 rounded-md text-sm font-bold tracking-tight transition-all duration-200 ${isActive('/predict')}`}>
                AI Prediction
            </Link>
        </div>
    </div>
</div>
            </div>
          </nav>
          {}
          <main className="flex-grow relative w-full h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}