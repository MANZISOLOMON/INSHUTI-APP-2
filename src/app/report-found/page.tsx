import FinderUploadForm from "@/components/FinderUploadForm";

export const metadata = {
  title: "Report Found Item | Lost & Found Registry",
  description: "Securely report a found national ID, passport, permit, or lost property in Rwanda with zero-trust photo blurring and MoMo delivery fee escrow.",
};

export default function ReportFoundPage() {
  return (
    <div className="py-4">
      <FinderUploadForm />
    </div>
  );
}

