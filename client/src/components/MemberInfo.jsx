import InfoSection from "./InfoSection";
import '../pages/MemberAccountPage.css'

export default function MemberInfo({member, setEditSectionData, setShowEditModal}) {

  return (
    <div className='member-info-page'>
      <InfoSection
        title="Personal Information"
        data={[
          { label: 'First Name', value: member.firstName },
          { label: 'Last Name', value: member.lastName },
          { label: 'Date of Birth', value: member.dateOfBirth },
          { label: 'Email Address', value: member.email },
          { label: 'Phone Number', value: member.phone },
          { label: 'User Role', value: member.role },
        ]}
        onEdit={(sectionData) => {
          setEditSectionData(sectionData);
          setShowEditModal(true);
        }}
      />

      <InfoSection
        title="Info"
        data={[
          { label: 'Start Date', value: member.startDate },
          { label: 'Days Per Week', value: member.daysPerWeek },
          { label: 'Payment Frequency', value: member.paymentOption },
          { label: 'Price Point', value: member.pricePoint },
          { label: 'Referral Member', value: member.referralMember || ''},
        ]}
        onEdit={(sectionData) => {
          setEditSectionData(sectionData);
          setShowEditModal(true);
        }}
      />

      <InfoSection
        title="Address"
        data={[
          { label: 'Country', value: member.country },
          { label: 'City', value: member.city },
          { label: 'Postal Code', value: member.postalCode },
        ]}
        onEdit={(sectionData) => {
          setEditSectionData(sectionData);
          setShowEditModal(true);
        }}
      />
    </div>
  );
}