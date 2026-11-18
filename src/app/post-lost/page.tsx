import ClaimerBountyForm from "@/components/ClaimerBountyForm";

export const metadata = {
  title: "Post Lost Property Bounty | Found IN",
  description: "Found IN - Your Secure Recovery Solution. Post a reward bounty for your lost national ID, passport, driving permit, or property in Rwanda with secure MoMo escrow protection.",
};

export default function PostLostPage() {
  return (
    <div className="py-4">
      <ClaimerBountyForm />
    </div>
  );
}

