import ClaimerBountyForm from "@/components/ClaimerBountyForm";

export const metadata = {
  title: "Post Lost Property Bounty | Lost & Found Registry",
  description: "Post a reward bounty for your lost national ID, passport, driving permit, or property in Rwanda with secure MoMo escrow protection.",
};

export default function PostLostPage() {
  return (
    <div className="py-4">
      <ClaimerBountyForm />
    </div>
  );
}

