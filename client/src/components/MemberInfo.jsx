import InfoSection from "./InfoSection";
import MembershipInfoSection from "./MembershipInfoSection";
import '../pages/MemberAccountPage.css'

export default function MemberInfo({member, setEditSectionData, setShowEditModal}) {

  return (
    <div className='member-info-page'>
      <InfoSection
        title="Personal Information"
        data={[
          { label: 'First Name', value: member.firstName, dbName: 'firstName' },
          { label: 'Last Name', value: member.lastName, dbName: 'lastName' },
          { label: 'Date of Birth', value: member.dateOfBirth, dbName: 'dateOfBirth' },
          { label: 'Email Address', value: member.email, dbName: 'email' },
          { label: 'Phone Number', value: member.phone, dbName: 'phoneNumber' },
        ]}
        onEdit={(sectionData) => {
          setEditSectionData(sectionData);
          setShowEditModal(true);
        }}
      />

      <MembershipInfoSection member={member} />

      <InfoSection
        title="Address"
        data={[
          { label: 'Country', value: member.country, dbName: 'country' },
          { label: 'City', value: member.city, dbName: 'city' },
          { label: 'Postal Code', value: member.postalCode, dbName: 'postalCode' },
        ]}
        onEdit={(sectionData) => {
          setEditSectionData(sectionData);
          setShowEditModal(true);
        }}
      />
    </div>
  );
}