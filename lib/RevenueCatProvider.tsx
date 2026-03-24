import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

/** * კონფიგურაცია: API კოდები აღებულია RevenueCat-ის დეშბორდიდან.
 * სასურველია ამ მონაცემების შენახვა .env ფაილში.
 */
const RC_API_KEYS = {
  apple: 'appl_cVBKnLTFVTxxMfsPjdcsewxpHtjY',
  google: 'goog_your_android_key_here',
};

// კონტექსტის ტიპების განსაზღვრა
interface RevenueCatContextType {
  isPremium: boolean;
  purchasePackage: (pack: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  isLoading: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
  // საწყისი სტატუსი ყოველთვის false-ია
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. დეველოპერული რეჟიმის (Expo Go) შემოწმება
        if (__DEV__) {
          console.log('🧪 RevenueCat: Mock Mode (Expo Go)');
          setIsPremium(true); // დეველოპმენტისას ავტომატურად გვქონდეს პრემიუმი
          setIsLoading(false);
          return;
        }

        // 2. RevenueCat-ის კონფიგურაცია (მუშაობს მხოლოდ Native Build-ში)
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        
        const apiKey = Platform.select({
          ios: RC_API_KEYS.apple,
          android: RC_API_KEYS.google,
        });

        if (apiKey) {
          await Purchases.configure({ 
            apiKey,
            appUserID: null, // RevenueCat თავად შექმნის ანონიმურ ID-ს
          });
        }

        // 3. მიმდინარე მომხმარებლის ინფორმაციის წამოღება
        const customerInfo = await Purchases.getCustomerInfo();
        updatePremiumStatus(customerInfo);

      } catch (e) {
        console.error("RevenueCat Init Error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /**
   * ამოწმებს არის თუ არა აქტიური 'pro' კონტენტი.
   * 'pro' უნდა ემთხვეოდეს RevenueCat-ში შექმნილ Entitlement ID-ს.
   */
  const updatePremiumStatus = (info: CustomerInfo) => {
    setIsPremium(info.entitlements.active['pro'] !== undefined);
  };

  /**
   * პაკეტის ყიდვის ფუნქცია
   */
  const purchasePackage = async (pack: PurchasesPackage): Promise<boolean> => {
    if (__DEV__) {
      console.log('🧪 Mock Purchase: Success');
      setIsPremium(true);
      return true;
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      if (customerInfo.entitlements.active['pro'] !== undefined) {
        setIsPremium(true);
        return true;
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error("Purchase Error:", e);
      }
    }
    return false;
  };

  /**
   * შესყიდვების აღდგენის ფუნქცია (მაგ. აპლიკაციის ხელახლა ინსტალაციისას)
   */
  const restorePurchases = async () => {
    if (__DEV__) {
      console.log('🧪 Mock Restore: Success');
      setIsPremium(true);
      return;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      updatePremiumStatus(customerInfo);
    } catch (e) {
      console.error("Restore Error:", e);
    }
  };

  return (
    <RevenueCatContext.Provider value={{ isPremium, purchasePackage, restorePurchases, isLoading }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

// ჰუკი, რომელსაც გამოვიყენებთ სხვა კომპონენტებში
export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};