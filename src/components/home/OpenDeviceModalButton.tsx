"use client";

import { Search } from "lucide-react";
import { useDevice } from "@/components/providers/DeviceProvider";
import { useI18n } from "@/components/providers/I18nProvider";

/** Opens the global "Select Your Device" modal. */
export function OpenDeviceModalButton({ className }: { className?: string }) {
  const { openModal } = useDevice();
  const { dict } = useI18n();
  return (
    <button type="button" onClick={openModal} className={className}>
      <Search size={17} />
      {dict.home.selectDevice}
    </button>
  );
}
