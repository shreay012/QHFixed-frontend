"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateFromCookies } from "@/lib/redux/slices/regionSlice/regionSlice";

/**
 * Hydrates the region slice from cookies on mount.
 * Mount once near the root of the client tree.
 */
export default function RegionInitializer() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrateFromCookies());
  }, [dispatch]);
  return null;
}
