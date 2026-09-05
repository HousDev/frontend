// frontend/src/services/propertyChatService.ts

export interface OpenPropertyChatOptions {
  propertyId: number | string;
  propertyTitle?: string;
  propertySlug?: string;
  propertyPrice?: number | string;
  propertyLocation?: string;
  propertySociety?: string;
  propertyPhotos?: string[];
  executiveName?: string;
  executivePhone?: string;
  executiveAvatar?: string;
  initialMessage?: string;
}

/**
 * Global trigger to open the unified Property & Executive Chat Popup with property context
 */
export function openPropertyChat(options: OpenPropertyChatOptions) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open_property_chat", {
        detail: options,
      })
    );
  }
}
