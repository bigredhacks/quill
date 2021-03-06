const async = require("async");
const User = require("../models/User");

// In memory stats.
let stats = {};
function calculateStats() {
    console.log("Calculating stats...");
    const newStats = {
        lastUpdated: 0,

        total: 0,
        demo: {
            gender: {
                M: 0,
                F: 0,
                O: 0,
                N: 0,
            },
            schools: {},
            year: {
                2018: 0,
                2019: 0,
                2020: 0,
                2021: 0,
                2022: 0,
            },
        },

        teams: {},
        verified: 0,
        submitted: 0,
        admitted: 0,
        confirmed: 0,
        confirmedCornell: 0,
        declined: 0,

        confirmedFemale: 0,
        confirmedMale: 0,
        confirmedOther: 0,
        confirmedNone: 0,

        shirtSizes: {
            XS: 0,
            S: 0,
            M: 0,
            L: 0,
            XL: 0,
            XXL: 0,
            WXS: 0,
            WS: 0,
            WM: 0,
            WL: 0,
            WXL: 0,
            WXXL: 0,
            None: 0,
        },

        dietaryRestrictions: {},

        reimbursementTotal: 0,
        reimbursementMissing: 0,

        wantsHardware: 0,

        checkedIn: 0,
    };

    User.find({}).exec((err, users) => {
        if (err || !users) {
            throw err;
        }

        newStats.total = users.length;

        async.each(users, (user, callback) => {
            // Grab the email extension
            const email = user.email.split("@")[1];

            // Add to the gender
            newStats.demo.gender[user.profile.gender] += 1;

            // Count verified
            newStats.verified += user.verified ? 1 : 0;

            // Count submitted
            newStats.submitted += user.status.completedProfile ? 1 : 0;

            // Count accepted
            newStats.admitted += user.status.admitted ? 1 : 0;

            // Count confirmed
            newStats.confirmed += user.status.confirmed ? 1 : 0;

            // Count confirmed that are mit
            newStats.confirmedCornell += user.status.confirmed && email === "cornell.edu" ? 1 : 0;

            newStats.confirmedFemale += user.status.confirmed && user.profile.gender == "F" ? 1 : 0;
            newStats.confirmedMale += user.status.confirmed && user.profile.gender == "M" ? 1 : 0;
            newStats.confirmedOther += user.status.confirmed && user.profile.gender == "O" ? 1 : 0;
            newStats.confirmedNone += user.status.confirmed && user.profile.gender == "N" ? 1 : 0;

            // Count declined
            newStats.declined += user.status.declined ? 1 : 0;

            // Count the number of people who need reimbursements
            newStats.reimbursementTotal += user.profile.needsReimbursement ? 1 : 0;

            // Count the number of people who still need to be reimbursed
            newStats.reimbursementMissing += user.profile.needsReimbursement && !user.status.reimbursementGiven ? 1 : 0;

            // Count the number of people who want hardware
            newStats.wantsHardware += user.profile.wantsHardware ? 1 : 0;

            // Count schools
            if (!newStats.demo.schools[email]) {
                newStats.demo.schools[email] = {
                    submitted: 0,
                    admitted: 0,
                    confirmed: 0,
                    declined: 0,
                };
            }
            newStats.demo.schools[email].submitted += user.status.completedProfile ? 1 : 0;
            newStats.demo.schools[email].admitted += user.status.admitted ? 1 : 0;
            newStats.demo.schools[email].confirmed += user.status.confirmed ? 1 : 0;
            newStats.demo.schools[email].declined += user.status.declined ? 1 : 0;

            // Count graduation years
            if (user.profile.graduationYear) {
                newStats.demo.year[user.profile.graduationYear] += 1;
            }

            // Grab the team name if there is one
            // if (user.teamCode && user.teamCode.length > 0){
            //   if (!newStats.teams[user.teamCode]){
            //     newStats.teams[user.teamCode] = [];
            //   }
            //   newStats.teams[user.teamCode].push(user.profile.name);
            // }

            // Count shirt sizes
            if (user.profile.shirtSize in newStats.shirtSizes) {
                newStats.shirtSizes[user.profile.shirtSize] += 1;
            }

            // Dietary restrictions
            if (user.profile.dietaryRestrictions instanceof Array) {
                user.profile.dietaryRestrictions.forEach((restriction) => {
                    if (!newStats.dietaryRestrictions[restriction]) {
                        newStats.dietaryRestrictions[restriction] = 0;
                    }
                    newStats.dietaryRestrictions[restriction] += 1;
                });
            }

            // Count checked in
            newStats.checkedIn += user.status.checkedIn ? 1 : 0;

            callback(); // let async know we've finished
        }, () => {
            // Transform dietary restrictions into a series of objects
            const restrictions = [];
            Object.keys(newStats.dietaryRestrictions)
                .forEach((key) => {
                    restrictions.push({
                        name: key,
                        count: newStats.dietaryRestrictions[key],
                    });
                });
            newStats.dietaryRestrictions = restrictions;

            // Transform schools into an array of objects
            const schools = [];
            Object.keys(newStats.demo.schools)
                .forEach((key) => {
                    schools.push({
                        email: key,
                        count: newStats.demo.schools[key].submitted,
                        stats: newStats.demo.schools[key],
                    });
                });
            newStats.demo.schools = schools;

            // Likewise, transform the teams into an array of objects
            // var teams = [];
            // _.keys(newStats.teams)
            //   .forEach(function(key){
            //     teams.push({
            //       name: key,
            //       users: newStats.teams[key]
            //     });
            //   });
            // newStats.teams = teams;

            console.log("Stats updated!");
            newStats.lastUpdated = new Date();
            stats = newStats;
        });
    });
}

// Calculate once every five minutes.
calculateStats();
setInterval(calculateStats, 300000);

const Stats = {};

Stats.getUserStats = function () {
    return stats;
};

module.exports = Stats;
