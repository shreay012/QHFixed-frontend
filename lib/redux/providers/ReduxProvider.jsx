"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store/index";
import RegionInitializer from "@/components/providers/RegionInitializer";

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <RegionInitializer />
      {children}
    </Provider>
  );
}
