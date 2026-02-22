import { useState, useRef } from "react";

export default function MindfulnessPage({ data, setData }) {
  const [playingSound, setPlayingSound] = useState(null);
  const audioRef = useRef(null);

  const backgrounds = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1493244040629-496f6d136cc3",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  ];

  const sounds = [
    {
      name: "Ocean Waves",
      emoji: "🌊",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      name: "Rain Sounds",
      emoji: "🌧️",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      name: "Forest Birds",
      emoji: "🌲",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      name: "Crackling Fire",
      emoji: "🔥",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
  ];

  const handleSoundClick = (sound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const newAudio = new Audio(sound.url);
    newAudio.loop = true;
    newAudio.play();

    audioRef.current = newAudio;
    setPlayingSound(sound.name);

    // Increase mindfulness session count
    setData((prev) => ({
      ...prev,
      mindfulnessSessions: prev.mindfulnessSessions + 1,
    }));
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSound(null);
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mindfulness</h1>
        <p className="text-gray-500">
          Find peace and clarity through mindful practices
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {backgrounds.map((img, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden shadow hover:scale-105 transition duration-300"
          >
            <img
              src={img}
              alt="Meditation"
              className="w-full h-48 object-cover"
            />
          </div>
        ))}
      </div>

      {/* Ambient Sounds */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
        <div>
          <h2 className="text-xl font-semibold">🔊 Ambient Sounds</h2>
          <p className="text-gray-500">
            Natural soundscapes for meditation and focus
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sounds.map((sound) => (
            <button
              key={sound.name}
              onClick={() => handleSoundClick(sound)}
              className={`p-6 rounded-xl border text-center transition ${
                playingSound === sound.name
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="text-3xl mb-2">{sound.emoji}</div>
              <div>{sound.name}</div>
            </button>
          ))}
        </div>

        {playingSound && (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Now Playing:{" "}
              <span className="font-medium">{playingSound}</span>
            </p>
            <button
              onClick={stopSound}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Stop Sound
            </button>
          </div>
        )}
      </div>
    </div>
  );
}