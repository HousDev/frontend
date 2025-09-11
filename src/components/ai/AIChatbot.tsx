import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Brain,
  User,
  Minimize2,
  Maximize2,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
};

const AIChatbot: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = width > 0 ? width < 640 : false; // <640px treated as mobile
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Namaste! I'm RE AI Agent, your intelligent real estate assistant. I can help you with property search, market analysis, pricing, legal guidance, and investment advice. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['Find properties under ₹1 Cr', 'Market trends in Bandra', 'Calculate EMI', 'Best investment areas']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    'Properties under ₹1 Cr',
    'Best areas for investment',
    'Calculate EMI for home loan',
    'Market trends analysis',
    'Legal documentation help',
    'Property valuation'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized, isOpen]);

  const generateBotResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();

    // (kept same logic as you provided) - trimmed here for brevity; in practice copy all cases:
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('₹') || lowerMessage.includes('under')) {
      return {
        text: '💰 **Property Pricing Analysis**\n\nBased on current market data:\n\n📍 **Mumbai Average Prices:**\n• Andheri West: ₹15,000-₹22,000/sq ft\n• Bandra West: ₹25,000-₹35,000/sq ft\n• Powai: ₹12,000-₹18,000/sq ft\n• Juhu: ₹20,000-₹30,000/sq ft\n\n🏠 **For Budget ₹1 Cr, you can get:**\n• 600-800 sq ft in Andheri West\n• 450-550 sq ft in Bandra West\n• 700-900 sq ft in Powai\n\nWould you like me to show you specific properties in your budget range?',
        suggestions: ['Show properties under ₹1 Cr', 'Calculate affordability', 'Compare locations', 'EMI calculator']
      };
    } else if (lowerMessage.includes('investment') || lowerMessage.includes('roi') || lowerMessage.includes('growth') || lowerMessage.includes('best area')) {
      return {
        text: '📈 **AI Investment Analysis**\n\n🎯 **Top Investment Hotspots 2025:**\n\n1️⃣ **Powai** - 18% projected growth\n   • IT hub proximity\n   • Infrastructure development\n   • Lake-facing premium\n\n2️⃣ **Andheri West** - 15% projected growth\n   • Metro connectivity\n   • Commercial hub\n   • Airport proximity\n\n3️⃣ **Thane West** - 22% projected growth\n   • Affordable entry point\n   • Rapid development\n   • Good connectivity\n\n🤖 **AI Recommendation:** Powai offers the best risk-to-reward ratio for 2025.',
        suggestions: ['Show Powai properties', 'Investment calculator', 'Market trends', 'Risk analysis']
      };
    } else if (lowerMessage.includes('emi') || lowerMessage.includes('loan') || lowerMessage.includes('mortgage') || lowerMessage.includes('calculate')) {
      return {
        text: '🏦 **Smart EMI Calculator**\n\n📊 **Sample Calculations:**\n\n**₹50L Loan @ 8.5% for 20 years:**\n💳 Monthly EMI: ₹43,391\n💰 Total Interest: ₹54.14L\n📈 Total Amount: ₹1.04 Cr\n\n**₹1Cr Loan @ 8.5% for 20 years:**\n💳 Monthly EMI: ₹86,782\n💰 Total Interest: ₹1.08 Cr\n📈 Total Amount: ₹2.08 Cr\n\n🎯 **AI Tips:**\n• Choose 15-year tenure to save ₹20L+ interest\n• Prepay ₹1L annually to reduce tenure by 3 years\n• CIBIL 750+ gets you 0.5% lower rates\n\nWant me to calculate for your specific amount?',
        suggestions: ['Calculate for my amount', 'Loan eligibility check', 'Compare banks', 'Prepayment benefits']
      };
    } else if (lowerMessage.includes('trend') || lowerMessage.includes('market') || lowerMessage.includes('bandra') || lowerMessage.includes('andheri')) {
      return {
        text: '📊 **AI Market Intelligence**\n\n🔥 **Current Trends (Jan 2025):**\n\n**🏆 Bandra West:**\n• Price: +12.8% in 6 months\n• Demand: Very High (9.2/10)\n• Supply: Limited (4.1/10)\n• Rental Yield: 2.8%\n\n**📈 Andheri West:**\n• Price: +8.7% in 6 months\n• Demand: High (8.5/10)\n• Supply: Moderate (6.2/10)\n• Rental Yield: 3.2%\n\n**🚀 Price Drivers:**\n• Metro Line 3 completion\n• IT company expansions\n• Premium retail developments\n\n**🎯 AI Prediction:** 15-18% growth expected in next 12 months.',
        suggestions: ['Location comparison', 'Future predictions', 'Investment hotspots', 'Rental analysis']
      };
    } else if (lowerMessage.includes('legal') || lowerMessage.includes('document') || lowerMessage.includes('paper') || lowerMessage.includes('registration')) {
      return {
        text: '⚖️ **Legal Documentation Guide**\n\n📋 **Essential Documents for Purchase:**\n\n✅ **Seller Documents:**\n• Original Sale Deed\n• Title Certificate Chain\n• Approved Building Plan\n• Occupancy Certificate\n• Property Tax Receipts (3 years)\n• Society NOC\n\n✅ **Verification Required:**\n• Encumbrance Certificate (30 years)\n• Revenue Records\n• RERA Registration\n• Completion Certificate\n\n⚡ **Our Legal AI checks:**\n• Document authenticity\n• Legal title verification\n• Compliance status\n• Hidden liabilities\n\n🛡️ **Risk Score:** We provide 0-100 legal safety score for every property.',
        suggestions: ['Document verification', 'Legal consultation', 'Title search', 'Registration process']
      };
    } else if (lowerMessage.includes('amenities') || lowerMessage.includes('facilities') || lowerMessage.includes('club') || lowerMessage.includes('gym')) {
      return {
        text: '🏢 **Premium Amenities Analysis**\n\n🌟 **Must-Have Modern Amenities:**\n\n🏊‍♂️ **Wellness:**\n• Swimming Pool (adds 15% value)\n• Fully-equipped Gym\n• Yoga/Meditation Area\n• Spa & Wellness Center\n\n🎯 **Entertainment:**\n• Clubhouse with Events Hall\n• Indoor Games Room\n• Kids Play Area\n• Library & Co-working\n\n🔒 **Security & Tech:**\n• 24/7 CCTV Surveillance\n• Biometric Access\n• Intercom Systems\n• Smart Home Integration\n\n🚗 **Convenience:**\n• Covered Parking\n• EV Charging Stations\n• Power Backup\n• Water Treatment Plant\n\n🤖 **AI Insight:** Properties with 8+ premium amenities appreciate 25% faster.',
        suggestions: ['Amenity-rich properties', 'Compare amenities', 'Value analysis', 'Future amenities']
      };
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('namaste')) {
      return {
        text: "🙏 **Namaste & Welcome to RE AI Agent!**\n\nI'm your intelligent real estate companion, powered by advanced AI algorithms and real-time market data. Here's how I can supercharge your property journey:\n\n🏠 **Smart Property Search**\n• AI-matched recommendations\n• Budget optimization\n• Location intelligence\n\n💡 **Market Intelligence**\n• Real-time price trends\n• ROI predictions\n• Investment hotspots\n\n🤖 **Personalized Assistance**\n• EMI calculations\n• Legal guidance\n• Documentation support\n\nWhat would you like to explore first? I'm here 24/7 to help!",
        suggestions: ['Find my dream home', 'Investment opportunities', 'Market analysis', 'Calculate affordability']
      };
    } else if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('difference')) {
      return {
        text: '⚖️ **AI Property Comparison**\n\n📊 **Location Comparison Matrix:**\n\n**Andheri West vs Bandra West:**\n\n🏆 **Andheri West:**\n• Price: ₹15-22K/sq ft\n• Connectivity: Metro + Airport\n• Growth: 15% annually\n• Best for: IT professionals\n\n🏆 **Bandra West:**\n• Price: ₹25-35K/sq ft\n• Connectivity: Station + Sea link\n• Growth: 12% annually\n• Best for: Premium lifestyle\n\n**Winner depends on:**\n• Budget: Andheri (affordable)\n• Luxury: Bandra (premium)\n• ROI: Andheri (higher returns)\n• Prestige: Bandra (status symbol)\n\nWhich locations would you like me to compare in detail?',
        suggestions: ['Compare 3 locations', 'Price comparison', 'Connectivity analysis', 'Lifestyle comparison']
      };
    } else if (lowerMessage.includes('school') || lowerMessage.includes('education') || lowerMessage.includes('children') || lowerMessage.includes('family')) {
      return {
        text: '🎓 **Family-Friendly Areas Analysis**\n\n👨‍👩‍👧‍👦 **Best Areas for Families with Kids:**\n\n🏫 **Top Educational Hubs:**\n\n1️⃣ **Bandra West**\n• Dhirubhai Ambani International School\n• Jamnabai Narsee School\n• Hill Spring International\n\n2️⃣ **Powai**\n• Hiranandani Foundation School\n• Delhi Public School\n• JBCN International\n\n3️⃣ **Juhu**\n• Jamnabai Narsee School\n• Utpal Shanghvi Global School\n• SVKM International School\n\n🎯 **Family Amenities Nearby:**\n• Parks & playgrounds\n• Pediatric healthcare\n• Activity centers\n• Safe neighborhoods\n\n🤖 **AI Family Score:** Each area rated 0-100 for family suitability.',
        suggestions: ['School ratings', 'Family properties', 'Safety analysis', 'Kids activities nearby']
      };
    } else {
      return {
        text: "🤖 **RE AI Agent Understanding...**\n\nI'm here to help with all your real estate needs! I can assist you with:\n\n🏠 **Property Search & Analysis**\n💰 **Pricing & Investment Advice**\n📊 **Market Trends & Predictions**\n⚖️ **Legal Documentation**\n🏦 **Loan & EMI Calculations**\n📍 **Location Intelligence**\n\nCould you please be more specific about what you're looking for? For example:\n• \"Show me 2BHK under ₹80L in Andheri\"\n• \"Best investment areas in Mumbai\"\n• \"Calculate EMI for ₹60L loan\"\n\nI'm powered by real-time data and machine learning to give you the most accurate insights!",
        suggestions: ['Property search help', 'Investment advice', 'Market analysis', 'EMI calculator']
      };
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotResponse(inputMessage);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    // small delay so input updates before sending
    setTimeout(() => sendMessage(), 120);
  };

  // Floating button for closed state
  if (!isOpen) {
    return (
      <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className={`
            ${isMobile ? 'w-12 h-12 p-2' : 'w-14 h-14 p-3'}
            bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-105 transform transition
            flex items-center justify-center relative
          `}
        >
          <Brain size={isMobile ? 18 : 22} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles size={10} className="text-white" />
          </div>
        </button>
      </div>
    );
  }

  // Chat panel classes responsive
  const panelBase = `
    bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300
    ${isMobile ? 'w-full h-[75vh] rounded-t-2xl' : 'w-96 h-[600px]'}
    overflow-hidden flex flex-col
  `;

  const headerBg = 'flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white';

  return (
    <>
      {/* Backdrop for mobile to dim background */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`fixed z-50 ${isMobile ? 'inset-x-0 bottom-0 flex justify-center' : 'bottom-6 right-6'}`}
        role="dialog"
        aria-modal="true"
        aria-label="RE AI Agent chat"
      >
        <div className={panelBase} style={{ maxWidth: isMobile ? '100%' : undefined }}>
          {/* Header */}
          <div className={headerBg}>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative">
                <Brain size={18} />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-lg">RE AI Agent</h3>
                <p className="text-[10px] sm:text-xs text-blue-100 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                  Online • Intelligent
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Minimized view */}
          {isMinimized ? (
            <div className="flex items-center justify-between p-3">
              <div className="text-sm text-gray-700">Chat minimized</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                >
                  Open
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                className={`px-3 sm:px-4 py-3 overflow-y-auto flex-1 space-y-4`}
                style={{ maxHeight: isMobile ? 'calc(75vh - 160px)' : undefined }}
              >
                {messages.map((message) => (
                  <div key={message.id}>
                    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}>
                          {message.sender === 'user' ? <User size={16} /> : <Brain size={16} />}
                        </div>
                        <div className={`px-3 py-2 rounded-2xl text-sm ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.sender === 'bot' && message.suggestions && (
                      <div className="ml-10 mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickQuestion(suggestion)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Brain size={16} className="text-white" />
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-3 sm:px-4 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask RE AI Agent anything..."
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    aria-label="Message input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
