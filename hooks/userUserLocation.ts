import { useLocationStore } from "@/stores/stores";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

const supabase = createClient();

const useUserLocation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocationStore((state) => state.location);

  useEffect(() => {
    const fetchUserAndLocation = async () => {
      const user = supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      if (!location && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { latitude, longitude };
            useLocationStore.getState().setLocation(locationData); // Save to Zustand store directly

            const { error: updateError } = await supabase
              .from("profiles")
              .update({ user_location: locationData })
              .eq("id", (await user).data.user?.id);

            if (updateError) {
              setError(updateError as any);
            }
            setLoading(false);
          },
          (locationError) => {
            setError(locationError.message);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    };

    fetchUserAndLocation();
  }, [location]);

  return { location, loading, error };
};

export default useUserLocation;
