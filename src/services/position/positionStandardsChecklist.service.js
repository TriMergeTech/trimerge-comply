const GOVERNMENT_JOB_POSTING_STANDARD = {
  standardId: 'usajobs_federal_announcement_v1',
  standardName: 'USAJOBS Federal Job Announcement Structure',
  version: '1.0',
  sourceBasis: [
    {
      name: 'USAJOBS Help Center - Job Announcement',
      url: 'https://help.usajobs.gov/how-to/job-announcement',
    },
    {
      name: 'USAJOBS Help Center - Overview',
      url: 'https://help.usajobs.gov/how-to/job-announcement/overview',
    },
    {
      name: 'USAJOBS Help Center - Requirements',
      url: 'https://help.usajobs.gov/how-to/job-announcement/requirements',
    },
  ],
  sections: [
    {
      id: 'overview',
      label: 'Overview',
      required: true,
      expectedContent: [
        'job title',
        'organization or agency',
        'open and closing date',
        'salary or pay range',
        'location or remote status',
        'work schedule',
        'appointment type',
        'travel requirement',
        'telework or remote eligibility',
      ],
    },
    {
      id: 'duties',
      label: 'Duties',
      required: true,
      expectedContent: [
        'primary responsibilities',
        'regular tasks',
        'scope of work',
        'supervisory responsibilities, if applicable',
        'mission or operational context',
      ],
    },
    {
      id: 'requirements',
      label: 'Requirements',
      required: true,
      expectedContent: [
        'conditions of employment',
        'citizenship or authorization requirement, if applicable',
        'background investigation or security clearance, if applicable',
        'drug testing requirement, if applicable',
        'probationary period, if applicable',
      ],
    },
    {
      id: 'qualifications',
      label: 'Qualifications',
      required: true,
      expectedContent: [
        'minimum qualifications',
        'specialized experience',
        'education requirements, if applicable',
        'licenses or certifications, if applicable',
        'knowledge, skills, and abilities',
        'equivalent experience language, where appropriate',
      ],
    },
    {
      id: 'benefits',
      label: 'Benefits',
      required: true,
      expectedContent: [
        'health benefits',
        'retirement benefits',
        'leave or paid time off',
        'insurance benefits',
        'eligibility limits based on appointment type or schedule',
      ],
    },
    {
      id: 'evaluation',
      label: "How You'll Be Evaluated",
      required: true,
      expectedContent: [
        'evaluation criteria',
        'application review process',
        'assessment or questionnaire information, if applicable',
        'ranking or selection factors, if applicable',
      ],
    },
    {
      id: 'required_documents',
      label: 'Required Documents',
      required: true,
      expectedContent: [
        'resume',
        'transcripts, if education is required',
        'certifications or licenses, if required',
        'veterans preference documents, if applicable',
        'other eligibility documents, if applicable',
      ],
    },
    {
      id: 'how_to_apply',
      label: 'How to Apply',
      required: true,
      expectedContent: [
        'application submission method',
        'deadline',
        'required steps',
        'agency or HR contact information',
        'what applicants should expect after applying',
      ],
    },
    {
      id: 'equal_opportunity_accessibility',
      label: 'Equal Opportunity and Accessibility Notices',
      required: true,
      expectedContent: [
        'equal employment opportunity language',
        'reasonable accommodation instructions',
        'accessibility or accommodation contact information',
        'non-discrimination language',
      ],
    },
  ],
};

const getGovernmentJobPostingStandard = () => GOVERNMENT_JOB_POSTING_STANDARD;

module.exports = {
  getGovernmentJobPostingStandard,
};
