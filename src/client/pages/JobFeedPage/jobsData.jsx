export const configuration = {
  recordperPage: 1,
  currentPage: 1,
  totalRecords: 0,
  limitData: 20,
  isSearchServer: true,
};

export const CandidateTitle = {
  title: "Candidate's Details",
  description: "",
  bgImage: "",
};

export const QuestionsTitle = {
  title: "Please fill all the details relevant to the candidate",
  description: "",
  bgImage: "",
};

export const PersonalTitle = {
  title: "Personal Details",
  description: "",
  bgImage: "",
};

export const QuestionTypes = {
  LongText: "Long Text",
  ShortText: "Short Text",
  SingleSelect: "Single Select",
  MultiSelect: "Multi Select",
}

export const initialData = {
  firstName: '',
  lastName: '',
  phone: '',
  emailId: '',
}

export const advanceSearchModel = [
  { id: 1, displayName: "Keywords", name: "keywords", isActive: false, type: "multiselect" },
  { id: 2, displayName: "Location", name: "location", isActive: false, type: "multiselect" },
  // { id: 3, displayName: "Experience Level", name: "experienceLevel", isActive: false, type: "options" },
  { id: 4, displayName: "Job Type", name: "jobtype", isActive: false, type: "options" },
  // { id: 5, displayName: "Company Name", name: "companyName", isActive: false, type: "text" }
]

export const Dummy = [
  // { id: 1, name: "Registration", url: "sdfsdf" },
  { id: 1, name: "Privacy Policy", url:"https://www.hirewing.com/general-4" },
  { id: 2, name: "Terms&Conditions", url: "https://www.hirewing.com/copy-of-privacy-policy-cookies" },
  { id: 3, name: "Feedback", url: "https://www.hirewing.com/feedback" },
  { id: 4, name: "Contact Us", url: "https://www.hirewing.com/contact-8" },
  // { id: 6, name: "Terms of Use", url: "sdfsdf" },
];

export const Dummy1 = [
  { id: 6, name: "Accessibility at HireWing", url: "sdfsdf" },
  { id: 7, name: "Privacy Center", url: "sdfsdf" },
  { id: 8, name: "Cookies", url: "sdfsdf" },
  { id: 9, name: "PrivacyTerms", url: "sdfsdf" },
];

export const locationKms = ["2km", "10km", "50km", "100km", "Anywhere"];

export const experienceLevelModel = ["All", "Entry-level", "Mid-level", "Senior-level"];

export const typeModel = ["All", "Full time", "Part time", "Contract", "Intern"];


export const jobsData = [
  { displayName: "Job Id", value: "Job Id" },
  { displayName: "Title", value: "Title" },
  { displayName: "Employer", value: "Employer" },
  { displayName: "Candiate Name", value: "Candiate Name" },
  { displayName: "Candiate Status", value: "Candiate Status" },
];

export const initalFilter = { keywords: [], location: "", jobType: "", }

export const initialPrimary = [
  { title: 'Primary Color', value: "#FFD800" },
  { title: 'Secondary Color', value: "#3B4046" },
];

export const initialTypography = [
  {
    title: "Main Heading",
    name: "mainheading",
    fontName: '"Roboto", sans-serif',
    color: "#000000",
  },
  {
    title: "Body",
    name: "bodyheading",
    fontName: '"Roboto", sans-serif',
    color: "#000000",
  }
];

export const initalData = {
  logo: "/static/assests/Hirewing.png",
  preview: "nopreview.png",
  isJobPortal: false,
  primaryData: initialPrimary,
  typography: initialTypography,
  url: '', //process.env.REACT_APP_JOBBOARD_PORTAL_URL
};

export const initialSnackbar = { type: "", message: "" };