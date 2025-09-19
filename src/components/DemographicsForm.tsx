"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const demographicsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be 18 or older").max(120, "Please enter a valid age"),
  location: z.string().min(1, "Location is required"),
  profession: z.string().min(1, "Profession is required"),
  education: z.enum(["high-school", "bachelors", "masters", "phd", "other"], {
    required_error: "Please select your education level",
  }),
});

export type DemographicsData = z.infer<typeof demographicsSchema>;

interface DemographicsFormProps {
  onSubmit: (data: DemographicsData) => void;
}

export function DemographicsForm({ onSubmit }: DemographicsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DemographicsData>({
    resolver: zodResolver(demographicsSchema),
    mode: "onChange",
  });

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-8 text-center">Demographics Survey</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
              Name
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className="w-full p-4 border border-gray-300 text-black bg-white focus:border-black focus:outline-none text-lg"
              placeholder="Your name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-black mb-2">
              Age
            </label>
            <input
              {...register("age", { valueAsNumber: true })}
              type="number"
              id="age"
              min="18"
              max="120"
              className="w-full p-4 border border-gray-300 text-black bg-white focus:border-black focus:outline-none text-lg"
              placeholder="Your age"
            />
            {errors.age && (
              <p className="text-red-600 text-sm mt-1">{errors.age.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-black mb-2">
              General Location
            </label>
            <input
              {...register("location")}
              type="text"
              id="location"
              className="w-full p-4 border border-gray-300 text-black bg-white focus:border-black focus:outline-none text-lg"
              placeholder="City, State/Country"
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-black mb-2">
              Profession
            </label>
            <input
              {...register("profession")}
              type="text"
              id="profession"
              className="w-full p-4 border border-gray-300 text-black bg-white focus:border-black focus:outline-none text-lg"
              placeholder="Your profession or field of work"
            />
            {errors.profession && (
              <p className="text-red-600 text-sm mt-1">{errors.profession.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Highest Level of Education
          </label>
          <div className="space-y-2">
            {[
              { value: "high-school", label: "High School" },
              { value: "bachelors", label: "Bachelor's Degree" },
              { value: "masters", label: "Master's Degree" },
              { value: "phd", label: "PhD/Doctorate" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  {...register("education")}
                  type="radio"
                  value={option.value}
                  className="mr-3 accent-black"
                />
                <span className="text-black">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.education && (
            <p className="text-red-600 text-sm mt-1">{errors.education.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 bg-black text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Continue to Study
        </button>
      </form>
    </div>
  );
}