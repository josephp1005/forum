import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, TrendingUp } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              {/*<TrendingUp className="w-8 h-8 text-blue-600" />*/}
              <span className="text-xl font-bold text-blue-900">Forum</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Markets</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Portfolio</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Learn</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">API</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search markets..." 
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="outline">Sign In</Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
}