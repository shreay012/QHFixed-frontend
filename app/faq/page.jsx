import FaqHero from "@/features/faq/components/FaqHero";
import FaqContent from "@/features/faq/components/FaqContent";

export default function FAQ() {
  return (
    <div className=" bg-white">
      <div className="flex flex-col">
        <FaqHero />
        <FaqContent />
      </div>
    </div>
  );
}
