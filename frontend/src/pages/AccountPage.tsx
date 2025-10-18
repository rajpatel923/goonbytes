import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";

// Mapping of disease names to their info URLs

const diseaseWebsites = {
  "Apple Healthy": "https://www.almanac.com/plant/apples",
  "Apple Apple Scab":
    "https://extension.umn.edu/plant-diseases/apple-scab#:~:text=Quick%20facts&text=Scab%20is%20caused%20by%20a,many%20years%20in%20a%20row.",
  "Apple Black Rot":
    "https://extension.wvu.edu/lawn-gardening-pests/plant-disease/tree-fruit-disease/black-rot-disease-in-apples#:~:text=Black%20rot%20disease%2C%20caused%20by,varieties%20are%20the%20preferred%20hosts.",
  "Apple Cedar Apple Rust":
    "https://mortonarb.org/plant-and-protect/tree-plant-care/plant-care-resources/cedar-apple-rust/#:~:text=Cedar-apple%20rust%20is%20the,the%20survival%20of%20the%20fungus.",
  "Bell Pepper Healthy":
    "https://www.gardentech.com/blog/garden-and-lawn-protection/growing-your-own-bell-peppers#:~:text=Depending%20on%20your%20chosen%20varieties,on%20the%20vine%20whenever%20possible.",
  "Bell Pepper Bacterial Spot":
    "https://extension.wvu.edu/lawn-gardening-pests/plant-disease/fruit-vegetable-diseases/bacterial-leaf-spot-of-pepper#:~:text=Bacterial%20leaf%20spot%2C%20caused%20by,2005).",
  "Cherry Healthy": "https://www.almanac.com/plant/cherries",
  "Cherry Powdery Mildew":
    "https://treefruit.wsu.edu/crop-protection/disease-management/cherry-powdery-mildew/#:~:text=Powdery%20mildew%20of%20sweet%20and,1).",
  "Corn (Maize) Healthy": "https://ohioline.osu.edu/factsheet/anr-0148",
  "Corn (Maize) Cercospora Leaf Spot":
    "https://cropprotectionnetwork.org/encyclopedia/gray-leaf-spot-of-corn#:~:text=Gray%20leaf%20spot%2C%20caused%20by,to%20three%20weeks%20before%20tasseling.",
  "Corn (Maize) Common Rust":
    "https://extension.umn.edu/corn-pest-management/common-rust-corn#:~:text=Common%20rust%20frequently%20occurs%20in,the%20appearance%20of%20brown%20pustules.",
  "Corn (Maize) Northern Leaf Blight":
    "https://extension.umn.edu/corn-pest-management/northern-corn-leaf-blight#:~:text=Northern%20corn%20leaf%20blight%20occurs,hybrids%20are%20infected%20before%20silking.",
  "Grape Healthy":
    "https://wineserver.ucdavis.edu/viticulture-grape-growing-information",
  "Grape Black Rot":
    "https://extension.psu.edu/black-rot-on-grapes-in-home-gardens",
  "Grape Esca (Black Measles)":
    "https://ipm.ucanr.edu/agriculture/grape/esca-black-measles/#gsc.tab=0",
  "Grape Leaf Blight":
    "https://apps.extension.umn.edu/garden/diagnose/plant/fruit/grape/leavesspots.html",
  "Peach Healthy": "https://www.britannica.com/plant/peach",
  "Peach Bacterial Spot":
    "https://www.aces.edu/blog/topics/crop-production/bacterial-spot-treatment-in-peaches/#:~:text=Symptoms%20of%20bacterial%20spot%20are,angular%20appearance%20(figure%201).",
  "Potato Healthy": "https://www.almanac.com/plant/potatoes",
  "Potato Early Blight":
    "https://ipm.cahnr.uconn.edu/early-blight-and-late-blight-of-potato/#:~:text=Early%20blight%20of%20potato%20is,affects%20young%2C%20vigorously%20growing%20plants.",
  "Potato Late Blight":
    "https://ipm.cahnr.uconn.edu/early-blight-and-late-blight-of-potato/#:~:text=Early%20blight%20of%20potato%20is,affects%20young%2C%20vigorously%20growing%20plants.",
  "Strawberry Healthy":
    "https://bonnieplants.com/blogs/how-to-grow/growing-strawberries",
  "Strawberry Leaf Scorch":
    "https://ipm.ucanr.edu/PMG/GARDEN/FRUIT/DISEASE/leafscorch.html#:~:text=Leaf%20scorch%20causes%20brown%20to,%2C%20temperature%2C%20and%20other%20factors.",
  "Tomato Healthy":
    "https://extension.unh.edu/resource/growing-vegetables-tomatoes-fact-sheet-1",
  "Tomato Bacterial Spot":
    "https://hort.extension.wisc.edu/articles/bacterial-spot-of-tomato/#:~:text=Bacterial%20spot%20can%20affect%20all,brownish-red%20as%20they%20age.",
  "Tomato Early Blight":
    "https://extension.umd.edu/resource/early-blight-tomatoes/",
  "Tomato Late Blight": "https://www.rhs.org.uk/disease/tomato-blight",
  "Tomato Septoria Leaf Spot":
    "https://portal.ct.gov/caes/fact-sheets/plant-pathology/septoria-leaf-spot-of-tomato#:~:text=Septoria%20leaf%20spot%20is%20caused,%2C%20stems%2C%20and%20the%20calyx.",
  "Tomato Yellow Leaf Curl Virus":
    "https://agriculture.vic.gov.au/biosecurity/plant-diseases/vegetable-diseases/tomato-yellow-leaf-curl-virus#:~:text=Tomato%20yellow%20leaf%20curl%20virus%20(TYLCV)%20can%20infect%20over%2030,silverleaf%20whitefly%20(Bemisia%20tabaci).",
  "Cassava Bacterial Blight (CBB)":
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC8578842/#:~:text=Cassava%20bacterial%20blight%20(CBB)%20is,and%20the%20crop%20are%20limited.",
  "Cassava Brown Streak Disease (CBSD)":
    "https://www.sciencedirect.com/topics/agricultural-and-biological-sciences/cassava-brown-streak-virus",
  "Cassava Green Mottle (CGM)":
    "https://plantwiseplusknowledgebank.org/doi/10.1079/pwkb.20227800039",
  "Cassava Mosaic Disease (CMD)":
    "https://farmonaut.com/blogs/cassava-mosaic-disease-symptoms-treatment-and-organic-control-methods-for-infected-plants/#:~:text=Cassava%20Mosaic%20Disease%20is%20a,as%20vectors%20for%20the%20virus.",
  Healthy: "https://plants.usda.gov/DocumentLibrary/plantguide/pdf/pg_maes.pdf",
};

// Type for a saved location entry
type SavedLocation = {
  id: string;
  location: string;
  date: string;
  top_crops: string[];
  coordinates: { lat: number; lng: number };
};

// Type for a saved crop entry
interface SavedCrop {
  id: string;
  crop_name: string;
  image_url: string;
  date_planted: string;
  plant_type: string;
  location: string;
  growth_season: string;
  harvest_time: string;
  notes?: string;
  disease_status: string | null;
}

interface SavedFarm {
  id: string;
  farm_name: string;
  image_url: string;
  date_created: string;
  farm_type: string;
  location_id: string;
  crop_ids: string[];
  notes?: string;
  location?: string;
}

export default function AccountPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [savedCrops, setSavedCrops] = useState<SavedCrop[]>([]);
  const [savedFarms, setSavedFarms] = useState<SavedFarm[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showAddFarmModal, setShowFarmModal] = useState(false);
  const [expandedFarm, setExpandedFarm] = useState<SavedFarm | null>(null);
  const [newCrop, setNewCrop] = useState<Partial<SavedCrop>>({});
  const [newFarm, setNewFarm] = useState<Partial<SavedFarm>>({});
  const [uploading, setUploading] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState<SavedCrop | null>(null);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "link">(
    "upload"
  );
  const [editCropMode, setCropEditMode] = useState(false);
  const [editFarmMode, setFarmEditMode] = useState(false);
  const [deletingFarmId, setDeletingFarmId] = useState<string | null>(null);
  const [deletingCropId, setDeletingCropId] = useState<string | null>(null);

  const [cropAILoading, setCropAILoading] = useState<boolean>(false);

  const location = useLocation();

  const getSavedLocationString = (location_id: string): string => {
    if (savedLocations.length <= 0) {
      return "";
    }

    savedLocations.forEach((location) => {
      if (location.id == location_id) {
        return location.location;
      }
    });

    return "";
  };

  const addFarmFromMap = async (selectedLocation: string | null) => {
    const locationArr: string[] = selectedLocation.split(", ");

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(today.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    const { data, error } = await supabase
      .from("saved_locations")
      .insert([
        {
          coordinates: {
            lng: Number.parseInt(locationArr[0]),
            lat: Number.parseInt(locationArr[1]),
          },
          date: dateString,
          location: selectedLocation,
          top_crops: [""],
          user_id: user.id,
        },
      ])
      .select();

    if (error) throw error;

    setNewFarm({
      ...newFarm,
      location_id: data[0].id,
      location: selectedLocation,
      date_created: dateString,
    });
    setShowFarmModal(true);
  };

  useEffect(() => {
    if (location.state?.addingFarmFromMap) {
      const selectedLocation: string | null = location.state?.selectedLocation;
      addFarmFromMap(selectedLocation);
    }
  }, [navigate]);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      navigate("/");
    }

    // Fetch saved locations from Supabase
    const fetchSavedLocationsAndFarms = async () => {
      if (!user) return;

      let locationData;

      try {
        const { data, error } = await supabase
          .from("saved_locations")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Format data for UI
        locationData = data.map((location) => ({
          id: location.id,
          location: location.location,
          date: location.date,
          top_crops: location.top_crops,
          coordinates:
            typeof location.coordinates === "object" &&
            location.coordinates !== null &&
            "lat" in location.coordinates &&
            "lng" in location.coordinates
              ? (location.coordinates as { lat: number; lng: number })
              : { lat: 0, lng: 0 },
        }));
        setSavedLocations(locationData);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error fetching saved locations:", errorMessage);
        toast({
          title: "Error fetching locations",
          description:
            "We couldn't load your saved locations. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }

      try {
        const { data, error } = await supabase
          .from("saved_farms")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        // Format data for UI
        let formattedFarms = (data || []).map((farm: SavedFarm) => ({
          id: farm.id,
          farm_name: farm.farm_name,
          image_url: farm.image_url,
          date_created: farm.date_created,
          farm_type: farm.farm_type,
          location_id: farm.location_id,
          crop_ids: farm.crop_ids,
          notes: farm.notes || undefined,
        }));

        if (formattedFarms.length > 0 && locationData.length > 0) {
          formattedFarms.forEach((currFarm) => {
            locationData.forEach((currLocation) => {
              if (currFarm.location_id == currLocation.id) {
                formattedFarms = formattedFarms.map((farm) =>
                  farm.id === currFarm.id
                    ? { ...farm, location: currLocation.location }
                    : farm
                );
              }
            });
          });
        }

        setSavedFarms(formattedFarms);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast({
          title: "Error fetching farms",
          description:
            "We couldn't load your saved farms. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingFarms(false);
      }
    };

    // Fetch saved crops from Supabase
    const fetchSavedCrops = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("saved_crops")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        // Format data for UI
        const formattedCrops = (data || []).map((crop: SavedCrop) => ({
          id: crop.id,
          crop_name: crop.crop_name,
          image_url: crop.image_url,
          date_planted: crop.date_planted,
          plant_type: crop.plant_type,
          location: crop.location,
          growth_season: crop.growth_season,
          harvest_time: crop.harvest_time,
          disease_status: crop.disease_status,
          notes: crop.notes || undefined,
        }));
        setSavedCrops(formattedCrops);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast({
          title: "Error fetching crops",
          description:
            "We couldn't load your saved crops. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingCrops(false);
      }
    };

    if (user) {
      fetchSavedLocationsAndFarms();
      fetchSavedCrops();
    }
  }, [user, loading, navigate, toast]);

  // Handler for deleting a farm
  const handleDeleteFarm = async (farmId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this farm? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingFarmId(farmId);
    try {
      const { error } = await supabase
        .from("saved_farms")
        .delete()
        .eq("id", farmId);

      if (error) throw error;

      // Remove the farm from local state
      setSavedFarms((prevFarms) =>
        prevFarms.filter((farm) => farm.id !== farmId)
      );

      // Close expanded farm modal if it's the one being deleted
      if (expandedFarm?.id === farmId) {
        setExpandedFarm(null);
      }

      toast({ title: "Farm deleted successfully!" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error deleting farm",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingFarmId(null);
    }
  };

  const detectDiseaseDuringEdit = async (publicUrlData: {
    publicUrl: string;
  }) => {
    setCropAILoading(true);

    const AIOutput = await detectDiseasesWithAI(
      publicUrlData.publicUrl,
      expandedCrop.plant_type
    );

    console.log(AIOutput);
    setExpandedCrop({
      ...expandedCrop,
      disease_status: AIOutput,
      image_url: publicUrlData.publicUrl,
    });

    setCropAILoading(false);

    toast({ title: "Image uploaded!" });
  };

  const detectDiseaseDuringNewCrop = async (publicUrlData: {
    publicUrl: string;
  }) => {
    setCropAILoading(true);

    const AIOutput = await detectDiseasesWithAI(
      publicUrlData.publicUrl,
      newCrop.plant_type
    );

    console.log(AIOutput);
    setNewCrop({
      ...newCrop,
      disease_status: AIOutput,
      image_url: publicUrlData.publicUrl,
    });

    setCropAILoading(false);

    toast({ title: "Image uploaded!" });
  };

  // Handler for deleting a crop
  const handleDeleteCrop = async (cropId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this crop? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingCropId(cropId);
    try {
      const { error } = await supabase
        .from("saved_crops")
        .delete()
        .eq("id", cropId);

      if (error) throw error;

      // Remove the crop from local state
      setSavedCrops((prevCrops) =>
        prevCrops.filter((crop) => crop.id !== cropId)
      );

      if (expandedFarm) {
        setExpandedFarm({
          ...expandedFarm,
          crop_ids: expandedFarm.crop_ids.filter(
            (crop_ID) => crop_ID !== cropId
          ),
        });
      }

      // Close expanded crop modal if it's the one being deleted
      if (expandedCrop?.id === cropId) {
        setExpandedCrop(null);
      }

      toast({ title: "Crop deleted successfully!" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error deleting crop",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingCropId(null);
    }
  };

  // Handler for crop form submit
  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { data, error } = await supabase
        .from("saved_crops")
        .insert([
          {
            user_id: user.id,
            crop_name: newCrop.crop_name,
            image_url: newCrop.image_url,
            date_planted: newCrop.date_planted,
            plant_type: newCrop.plant_type,
            location: newCrop.location,
            growth_season: newCrop.growth_season,
            harvest_time: newCrop.harvest_time,
            notes: newCrop.notes,
          },
        ])
        .select();

      if (expandedFarm) {
        setExpandedFarm({
          ...expandedFarm,
          crop_ids: expandedFarm.crop_ids
            ? [...expandedFarm.crop_ids, data[0].id]
            : [data[0].id],
        });
      }

      if (error) throw error;
      toast({ title: "Crop saved!" });
      setShowCropModal(false);
      setNewCrop({});
      setLoadingCrops(true);
      // Refetch crops
      const savedCropData = await supabase
        .from("saved_crops")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const formattedCrops = (savedCropData.data || []).map(
        (crop: SavedCrop) => ({
          id: crop.id,
          crop_name: crop.crop_name,
          image_url: crop.image_url,
          date_planted: crop.date_planted,
          plant_type: crop.plant_type,
          location: crop.location,
          growth_season: crop.growth_season,
          harvest_time: crop.harvest_time,
          disease_status: crop.disease_status,
          notes: crop.notes || undefined,
        })
      );
      setSavedCrops(formattedCrops);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error saving crop",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { data, error } = await supabase
        .from("saved_farms")
        .insert([
          {
            user_id: user.id,
            farm_name: newFarm.farm_name,
            image_url: newFarm.image_url,
            date_created: newFarm.date_created,
            farm_type: newFarm.farm_type,
            location_id: newFarm.location_id,
            crop_ids: newFarm.crop_ids,
            notes: newFarm.notes,
          },
        ])
        .select();
      if (error) throw error;
      toast({ title: "Farm saved!" });
      setShowFarmModal(false);

      setSavedFarms([...savedFarms, data[0]]);

      setNewFarm({});
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error saving farm",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handler for editing a crop
  const handleEditCrop = async (
    updatedCrop: Partial<SavedCrop> & { id: string }
  ) => {
    setUploading(true);
    try {
      const { error } = await supabase
        .from("saved_crops")
        .update(updatedCrop)
        .eq("id", updatedCrop.id);
      if (error) throw error;
      toast({ title: "Crop updated!" });
      setExpandedCrop(null);
      // Refetch crops
      const { data } = await supabase
        .from("saved_crops")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const formattedCrops = (data || []).map((crop: SavedCrop) => ({
        id: crop.id,
        crop_name: crop.crop_name,
        image_url: crop.image_url,
        date_planted: crop.date_planted,
        plant_type: crop.plant_type,
        location: crop.location,
        growth_season: crop.growth_season,
        harvest_time: crop.harvest_time,
        disease_status: crop.disease_status,
        notes: crop.notes || undefined,
      }));
      setSavedCrops(formattedCrops);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error updating crop",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handler for editing a crop
  const handleEditFarm = async (
    updatedFarm: Partial<SavedFarm> & { id: string }
  ) => {
    setUploading(true);
    try {
      const { location, ...farmWithoutLocation } = updatedFarm;

      //delete updatedFarmCopy.location;

      const { error } = await supabase
        .from("saved_farms")
        .update(farmWithoutLocation)
        .eq("id", farmWithoutLocation.id);
      if (error) throw error;
      toast({ title: "Farm updated!" });
      setExpandedFarm(null);
      // Refetch farms
      const { data } = await supabase
        .from("saved_farms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      let formattedFarms = (data || []).map((farm: SavedFarm) => ({
        id: farm.id,
        farm_name: farm.farm_name,
        image_url: farm.image_url,
        date_created: farm.date_created,
        farm_type: farm.farm_type,
        location_id: farm.location_id,
        crop_ids: farm.crop_ids,
        notes: farm.notes || undefined,
      }));

      if (formattedFarms.length > 0 && savedLocations.length > 0) {
        formattedFarms.forEach((currFarm) => {
          savedLocations.forEach((currLocation) => {
            if (currFarm.location_id == currLocation.id) {
              formattedFarms = formattedFarms.map((farm) =>
                farm.id === currFarm.id
                  ? { ...farm, location: currLocation.location }
                  : farm
              );
            }
          });
        });
      }

      setSavedFarms(formattedFarms);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error updating farm",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Add this handler for image upload
  const handleCropImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `crops/${user.id}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("crop-images")
        .upload(filePath, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from("crop-images")
        .getPublicUrl(filePath);

      detectDiseaseDuringNewCrop(publicUrlData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Image upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Add this handler for image upload
  const handleFarmImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `farms/${user.id}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("crop-images")
        .upload(filePath, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from("crop-images")
        .getPublicUrl(filePath);
      setNewFarm({ ...newFarm, image_url: publicUrlData.publicUrl });
      toast({ title: "Image uploaded!" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Image upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Show loader while checking auth or loading data
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  function convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  // Main AI detection logic
  const detectDiseasesWithAI = async (
    image_URL: string,
    cropType: string | null
  ): Promise<string | null> => {
    try {
      // Fetch image and convert to Blob
      const imageResponse = await fetch(image_URL);
      // Convert Blob to File (required for browser-image-compression)
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], "image.jpg", {
        type: imageBlob.type,
      });

      // Determine size based on cropType
      const isCassava = cropType?.toLowerCase().includes("cassava");
      const maxWidth = isCassava ? 800 : 224;
      const maxHeight = isCassava ? 600 : 224;

      // Resize and compress
      const compressedBlob = await imageCompression(imageFile, {
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        fileType: "image/jpeg",
      });

      // Convert to base64
      let base64data = await convertBlobToBase64(compressedBlob);

      if (!base64data) {
        console.error("Failed to convert image to base64.");
        return;
      }

      base64data = base64data.split(",")[1];

      // Send the request to the AI backend
      if (!cropType.toLowerCase().includes("cassava")) {
        // General AI endpoint
        let AIResponse;
        const response = await fetch(
          "http://10.0.0.81:5000/get-general-disease-AI",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64data, // your encoded image string
            }),
          }
        );

        return response.json();
      } else {
        // Casava AI endpoint
        let AIResponse;
        const response = await fetch("http://10.0.0.81:5000/get-casava-AI", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64data,
          }),
        });

        return response.json();
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="py-12">
        <div className="neurocrop-container">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header and sign out button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Your NeuroCrop Account
                </h1>
                <p className="text-muted-foreground">
                  View and manage your saved crop recommendations and analyses.
                </p>
              </div>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>

            {/* Account info card */}
            <div className="bg-card rounded-xl border border-border/50 p-6 mb-8">
              <h2 className="text-xl font-medium mb-2">Account Information</h2>
              <p className="text-muted-foreground mb-1">Email: {user.email}</p>
              <p className="text-muted-foreground">
                Member since: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Saved Farms header and add button */}
            <div className="flex items-center justify-between mb-6 mt-12">
              <h2 className="text-2xl font-bold">Your Saved Farms</h2>
              <Button asChild size="sm">
                <a href="/map-tool">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Farm
                </a>
              </Button>
            </div>
            {/* Saved farms list or loading/empty state */}
            {loadingFarms ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span>Loading your saved farms...</span>
              </div>
            ) : savedFarms.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {savedFarms.map((farm, index) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 min-h-[96px]">
                      <div
                        className="flex-shrink-0 w-24 h-24 flex items-center justify-center bg-muted rounded-lg overflow-hidden border ml-2"
                        onClick={() => {
                          setExpandedFarm(farm);
                          setFarmEditMode(false);
                        }}
                      >
                        {farm.image_url ? (
                          <img
                            src={farm.image_url}
                            alt={farm.farm_name}
                            className="object-cover w-full h-full cursor-pointer"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No Image
                          </span>
                        )}
                      </div>
                      <div
                        className="p-4 flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          setExpandedFarm(farm);
                          setFarmEditMode(false);
                        }}
                      >
                        <h3 className="text-lg font-medium mb-1 truncate">
                          {farm.farm_name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="mr-2 truncate">
                            Type: {farm.farm_type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="truncate">
                            Location: ({farm.location})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>
                            Date Created:{" "}
                            {farm.date_created
                              ? new Date(farm.date_created).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-xl border border-border/50 p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't saved any farms yet.
                </p>
                <Button asChild>
                  <a href="/map-tool">Add Your First Farm</a>
                </Button>
              </div>
            )}

            {/* Farm Modal */}
            {showAddFarmModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 w-full max-w-md shadow-lg relative">
                  <button
                    className="absolute top-1 right-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    onClick={() => setShowFarmModal(false)}
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-bold mb-4">Add a Farm</h3>
                  <form onSubmit={handleFarmSubmit} className="space-y-3">
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Farm Name"
                      required
                      value={newFarm.farm_name || ""}
                      onChange={(e) =>
                        setNewFarm({ ...newFarm, farm_name: e.target.value })
                      }
                    />
                    <div className="mb-2">
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${
                            imageInputMode === "upload"
                              ? "bg-primary text-white"
                              : "bg-muted"
                          }`}
                          onClick={() => setImageInputMode("upload")}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${
                            imageInputMode === "link"
                              ? "bg-primary text-white"
                              : "bg-muted"
                          }`}
                          onClick={() => setImageInputMode("link")}
                        >
                          Image Link
                        </button>
                      </div>
                      {imageInputMode === "upload" ? (
                        <label className="block cursor-pointer border-dashed border-2 border-primary rounded-lg p-4 text-center hover:bg-primary/10 transition">
                          <span className="block mb-2 text-primary font-medium">
                            Click to upload image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFarmImageUpload}
                          />
                        </label>
                      ) : (
                        <input
                          className="w-full border rounded px-3 py-2"
                          placeholder="Paste image URL"
                          value={newFarm.image_url || ""}
                          onChange={(e) =>
                            setNewFarm({
                              ...newFarm,
                              image_url: e.target.value,
                            })
                          }
                        />
                      )}
                      {newFarm.image_url && (
                        <img
                          src={newFarm.image_url}
                          alt="Farm"
                          className="w-24 h-24 object-cover rounded-lg border mt-2 mx-auto"
                        />
                      )}
                    </div>
                    <input
                      className="w-full border rounded px-3 py-2"
                      type="date"
                      placeholder="Date Created"
                      value={newFarm.date_created || ""}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setNewFarm({
                          ...newFarm,
                          date_created: e.target.value,
                        });
                      }}
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Type of Farm"
                      value={newFarm.farm_type || ""}
                      onChange={(e) =>
                        setNewFarm({ ...newFarm, farm_type: e.target.value })
                      }
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Location"
                      value={newFarm.location || ""}
                      disabled={true}
                    />
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      placeholder="Notes (optional)"
                      value={newFarm.notes || ""}
                      onChange={(e) =>
                        setNewFarm({ ...newFarm, notes: e.target.value })
                      }
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                      ) : null}
                      Save Farm
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Expanded Farm modal */}
            {expandedFarm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 w-full max-w-3xl shadow-2xl relative flex flex-col md:flex-row gap-10 min-h-[400px]">
                  <button
                    className="absolute top-1 right-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-2xl"
                    onClick={() => setExpandedFarm(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center justify-center w-full md:w-1/2">
                    {expandedFarm.image_url ? (
                      <div>
                        <img
                          src={expandedFarm.image_url}
                          alt={expandedFarm.farm_name}
                          className="w-full max-w-xs h-64 object-cover rounded-xl border mb-4"
                        />
                        {editFarmMode && (
                          <div>
                            <div
                              style={{
                                height: "230px",
                                overflowY: "auto",
                                marginTop: "20px",
                                marginBottom: "20px",
                              }}
                            >
                              <div style={{ marginBottom: "10px" }}>
                                <h2 className="text-xl font-bold">Crops:</h2>
                              </div>
                              {savedCrops.map(
                                (crop, index) =>
                                  expandedFarm.crop_ids &&
                                  expandedFarm.crop_ids.includes(crop.id) && (
                                    <motion.div
                                      key={crop.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.4,
                                        delay: index * 0.1,
                                      }}
                                    >
                                      <Card className="overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 min-h-[96px] mb-1">
                                        <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center bg-muted rounded-lg overflow-hidden border">
                                          {/* Delete button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteCrop(crop.id);
                                            }}
                                            disabled={
                                              deletingCropId === crop.id
                                            }
                                            className="absolute p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors z-10"
                                            style={{
                                              marginLeft: 500,
                                              marginBottom: 66,
                                            }}
                                            title="Delete crop"
                                          >
                                            {deletingCropId === crop.id ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-4 h-4" />
                                            )}
                                          </button>
                                          {crop.image_url ? (
                                            <img
                                              src={crop.image_url}
                                              alt={crop.crop_name}
                                              className="object-cover w-full h-full"
                                            />
                                          ) : (
                                            <span className="text-xs text-muted-foreground">
                                              No Image
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          style={{
                                            padding: "16px",
                                            width: "200px",
                                          }}
                                        >
                                          <h3 className="text-lg font-medium mb-1 truncate">
                                            {crop.crop_name}
                                          </h3>
                                        </div>
                                      </Card>
                                    </motion.div>
                                  )
                              )}
                            </div>
                            <div>
                              <Button
                                size="lg"
                                onClick={() => setShowCropModal(true)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Crop
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full max-w-xs h-64 flex items-center justify-center bg-muted rounded-xl border mb-4 text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {!editFarmMode && (
                      <div className="text-center text-muted-foreground text-xs">
                        Added:{" "}
                        {expandedFarm.date_created
                          ? new Date(
                              expandedFarm.date_created
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold mb-2">
                        {expandedFarm.farm_name}
                      </h2>
                      {!editFarmMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFarmEditMode(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    {editFarmMode ? (
                      <form
                        className="space-y-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditFarm(expandedFarm);
                          setFarmEditMode(false);
                        }}
                      >
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFarm(expandedFarm.id);
                          }}
                          disabled={deletingFarmId === expandedFarm.id}
                          className="absolute top-2 left-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors z-10"
                          title="Delete farm"
                        >
                          {deletingFarmId === expandedFarm.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          className="w-full border rounded px-3 py-2 font-bold text-xl"
                          value={expandedFarm.farm_name}
                          onChange={(e) =>
                            setExpandedFarm({
                              ...expandedFarm,
                              farm_name: e.target.value,
                            })
                          }
                        />
                        <div className="mb-2">
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              className={`px-3 py-1 rounded ${
                                imageInputMode === "upload"
                                  ? "bg-primary text-white"
                                  : "bg-muted"
                              }`}
                              onClick={() => setImageInputMode("upload")}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1 rounded ${
                                imageInputMode === "link"
                                  ? "bg-primary text-white"
                                  : "bg-muted"
                              }`}
                              onClick={() => setImageInputMode("link")}
                            >
                              Image Link
                            </button>
                          </div>
                          {imageInputMode === "upload" ? (
                            <label className="block cursor-pointer border-dashed border-2 border-primary rounded-lg p-4 text-center hover:bg-primary/10 transition">
                              <span className="block mb-2 text-primary font-medium">
                                Click or drag to upload image
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file || !user) return;
                                  setUploading(true);
                                  try {
                                    const fileExt = file.name.split(".").pop();
                                    const filePath = `farms/${
                                      user.id
                                    }/${Date.now()}.${fileExt}`;
                                    const { data, error } =
                                      await supabase.storage
                                        .from("crop-images")
                                        .upload(filePath, file);
                                    if (error) throw error;
                                    const { data: publicUrlData } =
                                      supabase.storage
                                        .from("crop-images")
                                        .getPublicUrl(filePath);
                                    setExpandedFarm({
                                      ...expandedFarm,
                                      image_url: publicUrlData.publicUrl,
                                    });
                                    toast({ title: "Image uploaded!" });
                                  } catch (error: unknown) {
                                    const errorMessage =
                                      error instanceof Error
                                        ? error.message
                                        : "Unknown error occurred";
                                    toast({
                                      title: "Image upload failed",
                                      description: errorMessage,
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setUploading(false);
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <input
                              className="w-full border rounded px-3 py-2"
                              placeholder="Paste image URL"
                              value={expandedFarm.image_url || ""}
                              onChange={(e) =>
                                setExpandedFarm({
                                  ...expandedFarm,
                                  image_url: e.target.value,
                                })
                              }
                            />
                          )}
                          {expandedFarm.image_url && (
                            <img
                              src={expandedFarm.image_url}
                              alt="Farm"
                              className="w-24 h-24 object-cover rounded-lg border mt-2 mx-auto"
                            />
                          )}
                        </div>
                        <input
                          className="w-full border rounded px-3 py-2"
                          value={expandedFarm.farm_type}
                          onChange={(e) =>
                            setExpandedFarm({
                              ...expandedFarm,
                              farm_type: e.target.value,
                            })
                          }
                        />
                        <input
                          className="w-full border rounded px-3 py-2"
                          type="date"
                          value={expandedFarm.date_created}
                          onChange={(e) =>
                            setExpandedFarm({
                              ...expandedFarm,
                              date_created: e.target.value,
                            })
                          }
                        />
                        <textarea
                          className="w-full border rounded px-3 py-2"
                          value={expandedFarm.notes || ""}
                          onChange={(e) =>
                            setExpandedFarm({
                              ...expandedFarm,
                              notes: e.target.value,
                            })
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={uploading}
                          >
                            {uploading ? (
                              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                            ) : null}
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setFarmEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="space-y-2">
                          <div className="text-lg font-semibold">
                            {expandedFarm.farm_name}
                          </div>
                          <div className="text-muted-foreground">
                            {expandedFarm.farm_type}
                          </div>
                          <div className="text-muted-foreground">
                            Location: {expandedFarm.location}
                          </div>
                          <div className="text-muted-foreground">
                            Date Planted:{" "}
                            {expandedFarm.date_created
                              ? new Date(
                                  expandedFarm.date_created
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                          {expandedFarm.notes && (
                            <div className="mt-2">
                              Notes: {expandedFarm.notes}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            height: "170px",
                            overflowY: "auto",
                            marginTop: "10px",
                          }}
                        >
                          {savedCrops.map(
                            (crop, index) =>
                              expandedFarm.crop_ids &&
                              expandedFarm.crop_ids.includes(crop.id) && (
                                <motion.div
                                  key={crop.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                  }}
                                  onClick={() => {
                                    setExpandedCrop(crop);
                                    setCropEditMode(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Card
                                    style={{ width: 350 }}
                                    className="overflow-hidden hover:shadow-md transition-shadow flex items-center gap-4 min-h-[96px]"
                                  >
                                    <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center bg-muted rounded-lg overflow-hidden border ml-2">
                                      {crop.image_url ? (
                                        <img
                                          src={crop.image_url}
                                          alt={crop.crop_name}
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          No Image
                                        </span>
                                      )}
                                    </div>
                                    <div className="p-4 flex-1 min-w-0">
                                      <h3 className="text-lg font-medium mb-1 truncate">
                                        {crop.crop_name}
                                      </h3>
                                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                                        <span className="mr-2 truncate">
                                          Type: {crop.plant_type}
                                        </span>
                                      </div>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <span>
                                          Date Planted:{" "}
                                          {crop.date_planted
                                            ? new Date(
                                                crop.date_planted
                                              ).toLocaleDateString()
                                            : "-"}
                                        </span>
                                      </div>
                                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                                        <span
                                          className="mr-2 truncate mt-1"
                                          style={{
                                            backgroundColor: crop.disease_status
                                              ? crop.disease_status.includes(
                                                  "Healthy"
                                                )
                                                ? "#53FF5399"
                                                : "#FF4545"
                                              : "#00000022",
                                            borderRadius: 20,
                                            paddingTop: 3,
                                            paddingBottom: 3,
                                            paddingLeft: 7,
                                            paddingRight: 7,
                                            color: "black",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          Status:{" "}
                                          {crop.disease_status
                                            ? crop.disease_status
                                                .toLowerCase()
                                                .includes("healthy")
                                              ? "Healthy"
                                              : crop.disease_status
                                            : "Unknown"}
                                        </span>
                                      </div>
                                    </div>
                                  </Card>
                                </motion.div>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Expanded crop modal */}
            {expandedCrop && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 w-full max-w-3xl shadow-2xl relative flex flex-col md:flex-row gap-10 min-h-[400px]">
                  <button
                    className="absolute top-1 right-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-2xl"
                    onClick={() => setExpandedCrop(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <div className="flex flex-col items-center justify-center w-full md:w-1/2">
                    {expandedCrop.image_url ? (
                      <img
                        src={expandedCrop.image_url}
                        alt={expandedCrop.crop_name}
                        className="w-full max-w-xs h-64 object-cover rounded-xl border mb-4"
                      />
                    ) : (
                      <div className="w-full max-w-xs h-64 flex items-center justify-center bg-muted rounded-xl border mb-4 text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {!editCropMode && (
                      <div className="text-center text-muted-foreground text-xs">
                        Added:{" "}
                        {expandedCrop.date_planted
                          ? new Date(
                              expandedCrop.date_planted
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold mb-2">
                        {expandedCrop.crop_name}
                      </h2>
                      {!editCropMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCropEditMode(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    {editCropMode ? (
                      <form
                        className="space-y-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditCrop(expandedCrop);
                          setCropEditMode(false);
                        }}
                      >
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCrop(expandedCrop.id);
                          }}
                          disabled={deletingCropId === expandedCrop.id}
                          className="absolute top-2 left-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors z-10"
                          title="Delete crop"
                        >
                          {deletingCropId === expandedCrop.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          className="w-full border rounded px-3 py-2 font-bold text-xl"
                          value={expandedCrop.crop_name}
                          onChange={(e) =>
                            setExpandedCrop({
                              ...expandedCrop,
                              crop_name: e.target.value,
                            })
                          }
                        />
                        <div className="mb-2">
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              className={`px-3 py-1 rounded ${
                                imageInputMode === "upload"
                                  ? "bg-primary text-white"
                                  : "bg-muted"
                              }`}
                              onClick={() => setImageInputMode("upload")}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1 rounded ${
                                imageInputMode === "link"
                                  ? "bg-primary text-white"
                                  : "bg-muted"
                              }`}
                              onClick={() => setImageInputMode("link")}
                            >
                              Image Link
                            </button>
                          </div>
                          {imageInputMode === "upload" ? (
                            <label className="block cursor-pointer border-dashed border-2 border-primary rounded-lg p-4 text-center hover:bg-primary/10 transition">
                              <span className="block mb-2 text-primary font-medium">
                                Click or drag to upload image
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file || !user) return;
                                  setUploading(true);
                                  try {
                                    const fileExt = file.name.split(".").pop();
                                    const filePath = `crops/${
                                      user.id
                                    }/${Date.now()}.${fileExt}`;
                                    const { data, error } =
                                      await supabase.storage
                                        .from("crop-images")
                                        .upload(filePath, file);
                                    if (error) throw error;
                                    const { data: publicUrlData } =
                                      supabase.storage
                                        .from("crop-images")
                                        .getPublicUrl(filePath);

                                    detectDiseaseDuringEdit(publicUrlData);
                                  } catch (error: unknown) {
                                    const errorMessage =
                                      error instanceof Error
                                        ? error.message
                                        : "Unknown error occurred";
                                    toast({
                                      title: "Image upload failed",
                                      description: errorMessage,
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setUploading(false);
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <input
                              className="w-full border rounded px-3 py-2"
                              placeholder="Paste image URL"
                              value={expandedCrop.image_url || ""}
                              onChange={(e) =>
                                setExpandedCrop({
                                  ...expandedCrop,
                                  image_url: e.target.value,
                                })
                              }
                            />
                          )}
                          {expandedCrop.image_url && (
                            <img
                              src={expandedCrop.image_url}
                              alt="Crop"
                              className="w-24 h-24 object-cover rounded-lg border mt-2 mx-auto"
                            />
                          )}
                        </div>
                        <input
                          className="w-full border rounded px-3 py-2"
                          value={expandedCrop.plant_type}
                          onChange={(e) =>
                            setExpandedCrop({
                              ...expandedCrop,
                              plant_type: e.target.value,
                            })
                          }
                        />
                        <input
                          className="w-full border rounded px-3 py-2"
                          type="date"
                          value={expandedCrop.date_planted}
                          onChange={(e) =>
                            setExpandedCrop({
                              ...expandedCrop,
                              date_planted: e.target.value,
                            })
                          }
                        />
                        <input
                          className="w-full border rounded px-3 py-2"
                          value={expandedCrop.growth_season}
                          onChange={(e) =>
                            setExpandedCrop({
                              ...expandedCrop,
                              growth_season: e.target.value,
                            })
                          }
                        />
                        <input
                          className="w-full border rounded px-3 py-2"
                          value={expandedCrop.harvest_time}
                          onChange={(e) =>
                            setExpandedCrop({
                              ...expandedCrop,
                              harvest_time: e.target.value,
                            })
                          }
                        />
                        <textarea
                          className="w-full border rounded px-3 py-2"
                          value={expandedCrop.notes || ""}
                          onChange={(e) =>
                            setExpandedCrop({
                              ...expandedCrop,
                              notes: e.target.value,
                            })
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={uploading || cropAILoading}
                          >
                            {uploading || cropAILoading ? (
                              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                            ) : null}
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setCropEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-lg font-semibold">
                          {expandedCrop.crop_name}
                        </div>
                        <div className="text-muted-foreground">
                          {expandedCrop.plant_type}
                        </div>
                        <div className="text-muted-foreground">
                          Growth Season: {expandedCrop.growth_season}
                        </div>
                        <div className="text-muted-foreground">
                          Harvest Time: {expandedCrop.harvest_time}
                        </div>
                        <div className="text-muted-foreground">
                          Date Planted:{" "}
                          {expandedCrop.date_planted
                            ? new Date(
                                expandedCrop.date_planted
                              ).toLocaleDateString()
                            : "-"}
                        </div>
                        {expandedCrop.notes && (
                          <div className="mt-2">
                            Notes: {expandedCrop.notes}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <span
                            className="mr-2 truncate font-semibold"
                            style={{
                              backgroundColor: expandedCrop.disease_status
                                ? expandedCrop.disease_status.includes(
                                    "Healthy"
                                  )
                                  ? "#53FF5399"
                                  : "#FF4545"
                                : "#00000022",
                              borderRadius: 20,
                              paddingTop: 3,
                              paddingBottom: 3,
                              paddingLeft: 7,
                              paddingRight: 7,
                              color: "black",
                            }}
                          >
                            Status:{" "}
                            {expandedCrop.disease_status
                              ? expandedCrop.disease_status
                                  .toLowerCase()
                                  .includes("healthy")
                                ? "Healthy"
                                : expandedCrop.disease_status
                              : "Unknown"}
                          </span>
                          <a
                            className="mr-2 truncate"
                            style={{
                              color: "blue",
                            }}
                            href={
                              diseaseWebsites[expandedCrop.disease_status]
                                ? diseaseWebsites[expandedCrop.disease_status]
                                : ""
                            }
                            target="_blank"
                          >
                            Learn more...
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Crop Modal */}
            {showCropModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 w-full max-w-md shadow-lg relative">
                  <button
                    className="absolute top-1 right-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    onClick={() => setShowCropModal(false)}
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-bold mb-4">Add a Crop</h3>
                  <form onSubmit={handleCropSubmit} className="space-y-3">
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Crop Name"
                      required
                      value={newCrop.crop_name || ""}
                      onChange={(e) =>
                        setNewCrop({ ...newCrop, crop_name: e.target.value })
                      }
                    />
                    <div className="mb-2">
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${
                            imageInputMode === "upload"
                              ? "bg-primary text-white"
                              : "bg-muted"
                          }`}
                          onClick={() => setImageInputMode("upload")}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${
                            imageInputMode === "link"
                              ? "bg-primary text-white"
                              : "bg-muted"
                          }`}
                          onClick={() => setImageInputMode("link")}
                        >
                          Image Link
                        </button>
                      </div>
                      {imageInputMode === "upload" ? (
                        <label className="block cursor-pointer border-dashed border-2 border-primary rounded-lg p-4 text-center hover:bg-primary/10 transition">
                          <span className="block mb-2 text-primary font-medium">
                            Click to upload image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCropImageUpload}
                          />
                        </label>
                      ) : (
                        <input
                          className="w-full border rounded px-3 py-2"
                          placeholder="Paste image URL"
                          value={newCrop.image_url || ""}
                          onChange={(e) =>
                            setNewCrop({
                              ...newCrop,
                              image_url: e.target.value,
                            })
                          }
                        />
                      )}
                      {newCrop.image_url && (
                        <img
                          src={newCrop.image_url}
                          alt="Crop"
                          className="w-24 h-24 object-cover rounded-lg border mt-2 mx-auto"
                        />
                      )}
                    </div>
                    <input
                      className="w-full border rounded px-3 py-2"
                      type="date"
                      placeholder="Date Planted"
                      value={newCrop.date_planted || ""}
                      onChange={(e) =>
                        setNewCrop({ ...newCrop, date_planted: e.target.value })
                      }
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Type of Plant"
                      value={newCrop.plant_type || ""}
                      onChange={(e) =>
                        setNewCrop({ ...newCrop, plant_type: e.target.value })
                      }
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Growth Season"
                      value={newCrop.growth_season || ""}
                      onChange={(e) =>
                        setNewCrop({
                          ...newCrop,
                          growth_season: e.target.value,
                        })
                      }
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Harvest Time"
                      value={newCrop.harvest_time || ""}
                      onChange={(e) =>
                        setNewCrop({ ...newCrop, harvest_time: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      placeholder="Notes (optional)"
                      value={newCrop.notes || ""}
                      onChange={(e) =>
                        setNewCrop({ ...newCrop, notes: e.target.value })
                      }
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={uploading || cropAILoading}
                    >
                      {uploading || cropAILoading ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                      ) : null}
                      Save Crop
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
