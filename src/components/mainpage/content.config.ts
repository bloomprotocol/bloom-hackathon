/**
 * Mainpage Content Configuration / 主頁面內容配置
 * 
 * This file contains all text content displayed in the mainpage components.
 * Edit this file to update any text without modifying component code.
 * 
 * 這個文件包含了主頁面組件中顯示的所有文字內容。
 * 編輯此文件即可更新任何文字，無需修改組件代碼。
 * 
 * Last updated: 2025-06-14T21:24:52.924Z
 * Updated via: Bloom Protocol Admin Panel
 */

export const mainpageContent = {
    "mainPage": {
      "welcomeLog": {
        "prefix": "%c",
        "fontSize": "20px"
      },
      "framingText": {
        "developer": {
          "title": "From Idea to Business — With Your First 1000 Believers",
          "subtitle": "Launch with quests, tools, and milestone-based crowdfunding."
        },
        "user": {
          "title": "Bloom Protocol: Where Early Support Builds Legends",
          "subtitle": "Support hidden gems. Track progress. Earn early access."
        }
      },
      "terminal": {
        "prompt": "$ Where will you start your journey today?",
        "toggleText": {
          "developer": "I'M A BUILDER",
          "user": "I'M A SUPPORTER"
        },
        "options": {
          "developer": {
            "option1": "[1] Launch a project with milestone funding",
            "option2": "[2] Find your early believers"
          },
          "user": {
            "option1": "[1] Discover early-stage projects",
            "option2": "[2] Join quests and unlock supporter perks"
          }
        }
      }
    },
    "terminalTransition": {
      "framingText": {
        "developer": {
          "title": "Milestone-Based Crowdfunding Starts Now",
          "subtitle": "Grow with your early supporters."
        },
        "user": {
          "title": "Minting your role in Bloom Protocol…",
          "subtitle": "Spot the vision before the crowd. Shape what comes next."
        }
      },
      "toggleText": {
        "developer": "TO THE MOON WITH COMMUNITY",
        "user": "TO THE MOON WITH BUILDER"
      },
      "commands": {
        "developer": {
          "option1": "$ bloom init --milestone-funding",
          "option2": "$ bloom connect --early-believers"
        },
        "user": {
          "option1": "$ bloom start --supporter-mode",
          "option2": "$ bloom explore --early-projects"
        }
      },
      "output": {
        "developer": {
          "option1": [
            "> Initializing your revenue engine...",
            "> Loading creator tools...",
            "> Setting up milestone tracking..."
          ],
          "option2": [
            "> Discovering creator ecosystem...",
            "> Scanning for opportunities...",
            "> Connecting to community..."
          ]
        },
        "user": {
          "option1": [
            "> Initializing supporter dashboard...",
            "> Early conviction detected",
            "> Pioneer identity: verified",
            "> Opening access gateway..."
          ],
          "option2": [
            "> Initializing supporter dashboard...",
            "> Early conviction detected",
            "> Pioneer identity: verified",
            "> Opening access gateway..."
          ]
        }
      },
      "emergence": {
        "text": "ENTERING"
      }
    },
    "journeyTimeline": {
      "header": {
        "title": "Your Journey with Bloom",
        "subtitle": "From zero to traction — one milestone at a time."
      },
      "stats": {
        "title": "Journey Stats",
        "command": "$ bloom stats --live",
        "labels": {
          "users": "Users:",
          "revenue": "Revenue:",
          "userFeedback": "User feedback:"
        }
      },
      "milestones": {
        "day7": {
          "label": "Growth tool",
          "event": "1st Quest launched",
          "metrics": [
            {
              "icon": "📈",
              "value": "312% engagement",
              "highlight": true
            },
            {
              "icon": "🎯",
              "value": "1,000+ users signed up",
              "highlight": false
            }
          ]
        },
        "day21": {
          "label": "Day 21",
          "event": "First Revenue! 💰",
          "metrics": [
            {
              "icon": "💵",
              "value": "$1,247 MRR",
              "highlight": true
            },
            {
              "icon": "🌱",
              "value": "150 trees",
              "highlight": false
            }
          ]
        },
        "day28": {
          "label": "Day 28",
          "event": "Exponential Growth",
          "metrics": [
            {
              "icon": "🚀",
              "value": "$5,420 MRR",
              "highlight": true
            },
            {
              "icon": "👥",
              "value": "1,284 users",
              "highlight": false
            }
          ]
        }
      },
      "emailSignup": {
        "title": "Ready to start your journey?",
        "buttonText": "Join the Waitlist",
        "successButtonText": "Welcome to Bloom!",
        "placeholderText": "Enter your email",
        "successPlaceholderText": "You're on the list!"
      },
      "backButton": {
        "text": "Back to Terminal"
      }
    },
    "rpg": {
      "header": {
        "title": "Your Power Arsenal",
        "subtitle": "Unlock tools as you level up"
      },
      "character": {
        "avatar": "🎮",
        "name": "Early Adopter",
        "type": "Power User",
        "levelPrefix": "LV",
        "points": {
          "label": "Points Collected",
          "suffix": "/1000"
        },
        "drops": {
          "label": "Water Drops Collected",
          "suffix": "drops to LV"
        }
      },
      "inventory": {
        "items": {
          "spark": {
            "name": "Spark Orb",
            "icon": "⚡",
            "countdown": "7 DAYS",
            "teaser": "3 projects confirmed"
          },
          "fund": {
            "name": "Fund Crystal",
            "icon": "💰",
            "countdown": "14 DAYS",
            "teaser": "$2.3M committed"
          },
          "boost": {
            "name": "Boost Rune",
            "icon": "🚀",
            "power": "ACTIVE"
          },
          "locked": {
            "icon": "🔒"
          }
        },
        "alerts": {
          "active": "Boost Pod Active! Complete quests and earn through referrals.",
          "comingSoon": "{name} unlocking in {countdown}. Join waitlist to get early access!"
        }
      },
      "emailSignup": {
        "title": "Be First When They Drop",
        "buttonTexts": [
          "Secure My Spot",
          "2,847 pioneers waiting"
        ],
        "successButtonText": "You're on the list!",
        "placeholderText": "Enter your email",
        "successPlaceholderText": "You're on the list!"
      }
    },
    "shared": {
      "emailForm": {
        "defaultPlaceholder": "Enter your email",
        "defaultSuccessPlaceholder": "You're on the list!"
      }
    }
  };
