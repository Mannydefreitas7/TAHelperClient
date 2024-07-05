export default {
  employeeId: '',
  employeeType: '',
  forms: {
    availabilityCalendar:  {
      category: 'orientation',
      name: 'Availability Calendar',
      preferredShift: '1 shift (7AM - 3PM)',
      question1: 'Is the below calendar your availability ongoing?',
      answer: 'No',
      options: ['Yes', 'No'],
      question2: 'Will your availability change frequently?',
      answer: 'Monthly, I will call Scheduling.',
      options: [
        'Weekly, I will call Scheduling.',
        'Monthly, I will call Scheduling.'
      ],
      shifts: [
        {
          name: '1 shift (7AM - 3PM)',
        },
        {
          name: '2nd Shift (3P - 11P)',
        },
        {
          name: '3rd Shift (11P-7A)',
        },
        {
          name: 'AM Visits (4 hours or less)'
        },
        {
          name: 'PM Visits (4 hours or less)'
        }
      ],
      preferredLocation: 'Sarasota',
      locations: [
        'Sarasota',
        'Bradenton',
        'Venice',
        'Charlotte'
      ],
      days: []
    },
  },
  entries: [
      {
        name: 'Hepatitis B Vaccine',
        category: 'orientation',
        hasReceivedHepatitisBVaccine: null,
        hepatitisBVaccineDate: null,
        hepatitisBVaccineLocation: null,
        complete: false,
        requestVaccination: null,
        requestVaccinationAcknowledgement: null,
      },
      {
        name: 'Consent for Publication',
        category: 'orientation',
        complete: false,
        acknowledgement: null,
      },
      {
        name: 'Acknowledgement of Receipt of Orientation of Safety Manual',
        category: 'orientation',
        complete: false,
        acknowledgement: null,
      },
      {
        name: 'EMPLOYEE’S ACKNOWLEDGEMENT OF ORIENTATION AND RECEIPT OF EMPLOYEE HANDBOOK',
        category: 'orientation',
        complete: false,
        acknowledgement: null,
      },
      {
        name: 'Availability',
        category: 'orientation',
        complete: false,
        locations: [],
        shifts: [],
        isAvailabilityOngoing: 'no',
        changeFrequency: null,
        days: {},
      }
    ],
};
