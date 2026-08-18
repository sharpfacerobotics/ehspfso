(function () {
  'use strict';

  window.EHS_ROSTER = {
    roleOrder: ['mechanical', 'software', 'outreach'],
    roleLabels: {
      mechanical: { title: 'Mechanical Team', subtitle: 'Design & Build' },
      software: { title: 'Software Team', subtitle: 'Programming & Controls' },
      outreach: { title: 'Outreach Team', subtitle: 'Community & Partnerships' }
    },
    teams: [
      {
        id: 'sharp-face',
        name: 'Sharp Face Robotics',
        monogram: 'SF',
        members: [
          {
            name: 'Varun Vasishta',
            section: 'mechanical',
            roles: [
              { label: 'Team Lead', type: 'leadership' },
              { label: 'Mechanical Lead', type: 'mechanical' }
            ],
            image: 'assets/varun.png',
            grade: 'Junior',
            favorite: 'Crashing into the Fadhil wall with no regret'
          },
          {
            name: 'Guhan Bala',
            section: 'mechanical',
            roles: [
              { label: 'Vice Captain', type: 'leadership' },
              { label: 'Mechanical', type: 'mechanical' }
            ],
            image: 'assets/guhan.png',
            grade: 'Sophomore',
            favorite: 'Helping build the team from the ground up, learn engineering skills, and meet teams with different approaches to the season'
          },
          {
            name: 'Sri Nithya Ganni',
            section: 'mechanical',
            roles: [{ label: 'Mechanical', type: 'mechanical' }]
          },
          {
            name: 'Arnav Gupta',
            section: 'software',
            roles: [
              { label: 'Software Lead', type: 'software' },
              { label: 'Vice Captain', type: 'leadership' }
            ],
            image: 'assets/arnav.png',
            grade: 'Junior',
            favorite: 'Programming donut routes'
          },
          {
            name: 'Alex Xu',
            section: 'software',
            roles: [
              { label: 'Vice Captain', type: 'leadership' },
              { label: 'Software', type: 'software' }
            ],
            image: 'assets/alex.png',
            grade: 'Freshman',
            favorite: 'Joining a competitive yet friendly community'
          },
          {
            name: 'Gautham Ramalingam',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }],
            grade: 'Sophomore',
            favorite: 'Optimizing robot performance'
          },
          {
            name: 'Srivibhav Padakandla',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }]
          },
          {
            name: 'Vivek Vasishta',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }],
            grade: 'Incoming Freshman',
            favorite: 'Driving and learning more code'
          }
        ]
      },
      {
        id: 'dark-force',
        name: 'Dark Force Robotics',
        monogram: 'DF',
        members: [
          {
            name: 'Rithik Kesani',
            section: 'mechanical',
            roles: [{ label: 'Mechanical', type: 'mechanical' }],
            image: 'assets/rithik.png',
            grade: 'Freshman',
            favorite: 'Designing and building the robot'
          },
          {
            name: 'Vivaan Brar',
            section: 'mechanical',
            roles: [{ label: 'Mechanical', type: 'mechanical' }],
            image: 'assets/vivaan.png',
            grade: 'Freshman',
            favorite: 'Improvising solutions quickly and learning through the challenges of a rookie season'
          },
          {
            name: 'Raghav Shah',
            section: 'mechanical',
            roles: [{ label: 'Mechanical', type: 'mechanical' }]
          },
          {
            name: 'Arpit Panda',
            section: 'mechanical',
            roles: [{ label: 'Mechanical', type: 'mechanical' }]
          },
          {
            name: 'Varshil Kaipu',
            section: 'mechanical',
            roles: [{ label: 'Mechanical', type: 'mechanical' }]
          },
          {
            name: 'Ryan Hoang',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }],
            grade: 'Sophomore',
            favorite: 'Cheering on the team'
          },
          {
            name: 'David Zhang',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }],
            image: 'assets/david.png',
            grade: 'Freshman',
            favorite: 'Seeing the robot make a shot'
          },
          {
            name: 'Corey Wan',
            section: 'software',
            roles: [
              { label: 'Software', type: 'software' },
              { label: 'Mechanical', type: 'mechanical' }
            ]
          },
          {
            name: 'Sidhak Khanuja',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }]
          },
          {
            name: 'Aryan Guddala',
            section: 'software',
            roles: [
              { label: 'Software', type: 'software' },
              { label: 'Mechanical', type: 'mechanical' }
            ]
          },
          {
            name: 'Leo Zhou',
            section: 'software',
            roles: [{ label: 'Software', type: 'software' }]
          },
          {
            name: 'Kevin Sun',
            section: 'outreach',
            roles: [{ label: 'Outreach', type: 'outreach' }],
            image: 'assets/kevin.png',
            grade: 'Sophomore',
            favorite: 'Watching the bot successfully complete a 12-ball autonomous routine'
          },
          {
            name: 'Deep Shah',
            section: 'outreach',
            roles: [{ label: 'Outreach', type: 'outreach' }],
            image: 'assets/deep.png',
            grade: 'Sophomore',
            favorite: 'Learning throughout the season with peers and creating nicknames for the team'
          },
          {
            name: 'Hussam Bajwa',
            section: 'outreach',
            roles: [{ label: 'Outreach', type: 'outreach' }],
            image: 'assets/hussam.png',
            grade: 'Sophomore',
            favorite: 'Meeting other teams and cheering on our team during games'
          },
          {
            name: 'Fadhil Kudbudeen',
            section: 'outreach',
            roles: [{ label: 'Outreach', type: 'outreach' }],
            grade: 'Sophomore',
            favorite: 'Getting team sponsors'
          },
          {
            name: 'Ishita Singh',
            section: 'outreach',
            roles: [{ label: 'Outreach', type: 'outreach' }],
            grade: 'Freshman',
            favorite: 'Cooperating with partners'
          }
        ]
      }
    ]
  };
})();
