
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type AuthNewsletterCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const AuthNewsletterCheckbox: React.FC<AuthNewsletterCheckboxProps> = ({ 
  checked, 
  onCheckedChange 
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-sage-50 px-3 py-3">
      <Checkbox 
        id="newsletter" 
        checked={checked} 
        onCheckedChange={v => onCheckedChange(!!v)} 
      />
      <Label htmlFor="newsletter" className="cursor-pointer text-sage-800 select-none text-sm">
        Garten-Newsletter abonnieren
        <span className="block text-xs text-sage-600 font-normal">Tipps, Ideen & Aktionen. Kein Spam!</span>
      </Label>
    </div>
  );
};

export default AuthNewsletterCheckbox;
