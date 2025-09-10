// // components/Modal.tsx
// import React from "react";

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   children: React.ReactNode;
//   width?: string; // optional custom width
// }

// const Modal: React.FC<ModalProps> = ({
//   isOpen,
//   onClose,
//   title,
//   children,
//   width = "max-w-[80vw] sm:max-w-sm md:max-w-md lg:max-w-lg",
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//       onClick={onClose}
//     >
//       <div
//         className={`bg-white rounded-lg shadow-lg w-full ${width} max-h-[90vh] flex flex-col relative`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {title && (
//           <div className="sticky top-0 bg-white z-10 border-b p-2">
//             <h2 className="text-lg font-semibold">{title}</h2>
//           </div>
//         )}

//         <div className="p-4 overflow-y-auto flex-1">
//           {children}
//         </div>

//         <button
//           onClick={onClose}
//           className="absolute top-0 right-3 text-gray-500 hover:text-gray-700 text-xl p-1 z-50"
//           aria-label="Close modal"
//         >
//           ✕
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Modal;

// components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string; // optional custom width
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-[80vw] sm:max-w-sm md:max-w-md lg:max-w-lg",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full ${width} max-h-[90vh] flex flex-col relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 bg-white z-10 border-b p-2 rounded-t-lg">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        <div className="p-4 overflow-y-auto flex-1 rounded-b-lg [&>*]:rounded-lg [&_input]:rounded-lg [&_select]:rounded-lg [&_textarea]:rounded-lg [&_button]:rounded-lg [&_.dropdown]:rounded-lg [&_.dropdown-menu]:rounded-lg [&_.border]:rounded-lg [&_.bg-white]:rounded-lg [&_.bg-gray-50]:rounded-lg [&_.bg-blue-100]:rounded-lg [&_div[class*='border']]:rounded-lg">
          {children}
        </div>

        <button
          onClick={onClose}
          className="absolute top-0 right-3 text-gray-500 hover:text-gray-700 text-xl p-1 z-50 rounded-lg"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Modal;
