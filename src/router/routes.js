import { h, resolveComponent } from "vue";
import { msalInstance } from "@/boot/msal";

function guard(to, from, next) {
    const account = msalInstance.getAccount();
      if (account) {
       //   No user signed in
         msalInstance.loginRedirect(import.meta.env.VITE_SCOPES.split(","));
     } else {
          next()
      }
}

const routes = [
  // {
  //   path: "/se",
  //   component: () => import("./../layouts/SurveyEvents.vue"),
  // },
  // {
  //   path: "/sr/:id",
  //   component: () => import("./../layouts/SurveyResponse.vue"),
  // },
  // {
  //   path: "/lr/:id",
  //   component: () => import("./../layouts/ListResponse.vue"),
  // },
  // {
  //   path: "/mr/:id",
  //   component: () => import("./../layouts/MediaResponse.vue"),
  // },
  // {
  //   path: "/mrc/:id",
  //   component: () => import("./../layouts/MediaCampaignResponse.vue"),
  // },
  // {
  //   path: "/email/subscription",
  //   component: () => import("./../layouts/EmailSubscription.vue"),
  // },
  // {
  //   path: "/media-response-feedback/:id/:status",
  //   component: () => import("./../layouts/MediaResponseFeedback.vue"),
  // },
  // {
  //   path: "/service-requirement-media-response-feedback/:id/:status",
  //   component: () => import("./../layouts/ExpiringServiceRequirementsResponseFeedback.vue"),
  // },
  // {
  //   path: "/vr/:id",
  //   component: () => import("./../layouts/VideoResponse.vue"),
  // },
  // {
  //   path: "/tcr/:version/:id",
  //   component: () => import("./../layouts/TimecardCorrectionResponse.vue"),
  // },
  // {
  //   path: "/tsr/:version/:id",
  //   component: () => import("./../layouts/TasksheetResponse.vue"),
  // },
  // {
  //   path: "/tkr/:version/:id",
  //   component: () => import("./../layouts/TimecardResponse.vue"),
  // },
  // {
  //   path: "/asr/:version/:surveyId/:id?",
  //   component: () => import("./../layouts/ActivitySheetResponse.vue"),
  // },
  // {
  //   path: "/dl/:id/:surveyId?",
  //   component: () => import("./../layouts/DocDownload.vue"),
  // },
  // {
  //   path: "/esr/:id",
  //   component: () => import("./../layouts/ExpiringServiceRequirementsResponse.vue"),
  // },
  // {
  //   path: "/fl/:id",
  //   component: () => import("./../layouts/FormResponse.vue"),
  // },
  // {
  //   path: "/hire",
  //   component: () => import("./../layouts/HireLayout.vue"),
  //   children: [
  //     {
  //       path: ":craftName?",
  //       component: () => import("./../pages/HR/HireFormsPageA.vue"),
  //     },
  //   ],
  // },
  // {
  //   path: "/NewHireForms",
  //   component: () => import("./../layouts/HireLayout.vue"),
  //   children: [
  //     {
  //       path: "a/:id",
  //       name: "Hire",
  //       component: () => import("./../pages/HR/HireFormsPageA.vue"),
  //     },
  //   ],
  // },
  {
    path: "/",
    name: "Home",
    beforeEnter: guard,
    component: () => import("./../layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("./../pages/Dashboard.vue"),
      },
      // {
      //   path: "Campaign",
      //   name: "Campaign",
      //   component: () => import("./../pages/Campaign.vue"),
      // },
      // {
      //   path: "Account",
      //   name: "Account",
      //   component: () => import("./../pages/Account.vue"),
      // },
      // {
      //   path: "MyProfile",
      //   name: "My Profile",
      //   component: () => import("./../pages/MyProfile.vue"),
      // },
      // {
      //   path: "Chat",
      //   name: "Chat",
      //   component: () => import("./../pages/Chat.vue"),
      // },
      // {
      //   path: "Contact",
      //   name: "Contact",
      //   component: () => import("./../pages/Contact.vue"),
      // },
      // {
      //   path: "Integration",
      //   name: "Integration",
      //   component: () => import("./../pages/Integration.vue"),
      // },
      // {
      //   path: "/Automation",
      //   name: "Automation",
      //   component: () => import("./../pages/Automation.vue")
      // },
      // {
      //   path: "Tenants",
      //   name: "Tenants",
      //   component: () => import("./../pages/Tenants.vue"),
      // },
      // {
      //   path: "Compliance",
      //   name: "Compliance",
      //   component: () => import("./../pages/Compliance.vue"),
      // },
      // {
      //   path: "Users",
      //   name: "Users",
      //   component: () => import("./../pages/Users.vue"),
      // },
      // {
      //   path: "Document",
      //   name: "Document",
      //   component: () => import("./../pages/Document.vue"),
      // },
      // {
      //   path: "Forms/:module?",
      //   name: "Forms",
      //   component: () => import("./../pages/Forms/Forms.vue"),
      // },
      // {
      //   path: "Timekeeping/:module?",
      //   name: "Timekeeping",
      //   component: () => import("./../pages/Timekeeping/Timekeeping.vue"),
      // },
      // {
      //   path: "tasks",
      //   name: "Tasks",
      //   component: () => import("./../pages/Tasks.vue"),
      // },
      // {
      //   path: "Surveys",
      //   name: "Surveys",
      //   component: () => import("./../pages/Surveys.vue"),
      // },
      // {
      //   path: "HR",
      //   name: "HR",
      //   component: () => import("./../pages/HR/HR.vue"),
      // },
      // {
      //   path: "Help",
      //   name: "Help",
      //   component: () => import("./../pages/Help.vue"),
      // },
      // {
      //   path: "Report",
      //   component: {
      //     render() {
      //       return h(resolveComponent('router-view'));
      //     },
      //   },
        // children: [
        //   {
        //     path: "",
        //     name: "Report",
        //     component: () => import("./../pages/Report/Report.vue"),
        //   },
        //   {
        //     path: ":report",
        //     name: "Run Report",
        //     meta: { parent: "Report" },
        //     component: () => import("./../pages/Report/RunReport.vue"),
        //   },
        // ],
     // },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:pathMatch(.*)*",
    component: () => import("./../pages/Error404.vue"),
  },
];

export default routes;
