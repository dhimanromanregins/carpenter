export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Ritika Malhotra",
    role: "Homeowner, Chandigarh",
    quote:
      "Dhiman Interiors turned our vision into something far more refined than we imagined. Every joint, every finish — museum quality.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Arjun Sethi",
    role: "Villa Owner, Mohali",
    quote:
      "The attention to detail on our walk-in wardrobe was staggering. They treated our home like their own masterpiece.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Neha Kapoor",
    role: "Interior Client, Panchkula",
    quote:
      "From the first sketch to the final polish, the process felt effortless. Genuinely the best carpentry studio we've worked with.",
    rating: 5,
  },
  {
    id: "t4",
    name: "Karan Bhatia",
    role: "Office Fit-out, Delhi NCR",
    quote:
      "Our boardroom now feels like a five-star hotel lobby. Precision craftsmanship paired with real design sensibility.",
    rating: 5,
  },
];
