// "use client";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
export default async function Home() {
  const supabase = createClient();

  // const user = supabase.auth.getUser();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const events = [
    {
      id: 1,
      title: "Join us for UFC fight night!!",
      host: "Cedric",
      distance: "1.5km",
      time: "12 min",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1675826774817-fe983ceb0475?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxM3x8fGVufDB8fHx8fA%3D%3D", // Replace with your image path
      location: "Carleton University",
    },
    // ... other events
  ];

  return (
    // <div className="max-w-xs mx-auto w-full h-screen bg-gray-50 flex flex-col gap-20 items-center">
    //   {/* <FetchDataSteps /> */}
    // </div>
    <div className="bg-gray-50 flex flex-col gap-4 w-full h-screen overflow-auto">
      <header className="text-center p-4">
        <h1 className="text-4xl font-bold text-purple-800">SWIBE</h1>
        <p className="text-2xl text-gray-700 my-2">Nearby</p>
      </header>

      <div className="px-4">
        {events.map((event) => (
          <div key={event.id} className="mb-4">
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={350}
              height={200}
              className="rounded-xl object-cover"
              layout="responsive"
            />
            <h2 className="text-xl font-semibold mt-2">{event.title}</h2>
            <p className="text-gray-600">
              {event.host} • {event.distance}
            </p>
            <p className="text-gray-500 text-sm">{event.time}</p>
          </div>
        ))}
      </div>

      {/* The Bottom Navigation Bar would be included here */}
    </div>
  );
}
