import React, { useState } from "react";
import { GraduationCap, PlayCircle, Eye, ArrowRight } from "lucide-react";

export default function CoursesTab() {
  const [playingVideo, setPlayingVideo] = useState(null);

  const courses = [
    {
      id: 1,
      title: "الوحدة الأولي عربي تالته ثانوي",
      description: "شرح شامل وتدريبات مكثفة على الوحدة الأولى.",
      videos: [
        { id: 1, title: "همزة الوصل والقطع - جزء 1", url: "https://www.youtube.com/embed/03hsHuIXLQE", thumbnail: "https://picsum.photos/400/225?random=1" },
        { id: 2, title: "همزة الوصل والقطع - جزء 2", url: "https://www.youtube.com/embed/gbst-g9OMdw", thumbnail: "https://picsum.photos/400/225?random=2" }
      ]
    }
  ];

  if (playingVideo) {
    return (
      <div className="space-y-4">
        <button onClick={() => setPlayingVideo(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 w-fit">
          <ArrowRight size={18} />
          عودة للكورسات
        </button>
        <div className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video relative">
          <iframe 
            src={`${playingVideo.url}?autoplay=1`} 
            title={playingVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
        <h2 className="text-2xl font-black text-gray-900 px-2">{playingVideo.title}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">كورساتي المشترك بها</h2>
          <p className="text-sm text-gray-500">تابع دروسك المسجلة المرفوعة من المدرس</p>
        </div>
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
          <GraduationCap size={32} />
        </div>
      </div>

      <div className="space-y-8">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black mb-1">{course.title}</h3>
                <p className="text-white/70 text-sm">{course.description}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                {course.videos.length} فيديوهات
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.videos.map(video => (
                <div key={video.id} className="group cursor-pointer" onClick={() => setPlayingVideo(video)}>
                  <div className="relative rounded-2xl overflow-hidden aspect-video shadow-sm mb-3">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="text-white w-14 h-14" />
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-[#009966] transition">{video.title}</h4>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
