
import React from "react";

type AuthToggleButtonsProps = {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
};

const AuthToggleButtons: React.FC<AuthToggleButtonsProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="flex justify-center gap-2 text-sm">
      <button
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          isLogin 
            ? "bg-sage-600 text-white" 
            : "text-sage-700 bg-sage-100 hover:bg-sage-200"
        }`}
        onClick={() => onToggle(true)}
        type="button"
      >
        Login
      </button>
      <button
        className={`px-4 py-2 rounded-full font-medium transition-colors ${
          !isLogin 
            ? "bg-sage-600 text-white" 
            : "text-sage-700 bg-sage-100 hover:bg-sage-200"
        }`}
        onClick={() => onToggle(false)}
        type="button"
      >
        Registrieren
      </button>
    </div>
  );
};

export default AuthToggleButtons;
