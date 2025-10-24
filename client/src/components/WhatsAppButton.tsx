import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = "+573123613288";
  const message = "Hola, me gustaría obtener más información sobre los tours en Amazonas.";

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        ¡Chatea con nosotros!
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
      </div>
    </button>
  );
}