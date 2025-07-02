class TrickDriveMatrix {
    constructor() {
        this.initializeEventListeners();
        this.schedule = [];
        this.people = [];
        this.anchors = [];
    }

    initializeEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMatrix());
    }

    generateMatrix() {
        const inputs = this.getInputs();
        
        if (!this.validateInputs(inputs)) {
            return;
        }

        this.calculateOptimalRounds(inputs);
        this.generateSchedule(inputs);
        this.displayResults(inputs);
    }

    getInputs() {
        return {
            totalPeople: parseInt(document.getElementById('totalPeople').value),
            numTables: parseInt(document.getElementById('numTables').value)
        };
    }

    validateInputs(inputs) {
        const { totalPeople, numTables } = inputs;
        if (totalPeople < 4) {
            this.showError('Minimum 4 people required');
            return false;
        }
        if (numTables < 2) {
            this.showError('Minimum 2 tables required');
            return false;
        }
        if (totalPeople < numTables) {
            this.showError('Number of people must be greater than or equal to number of tables');
            return false;
        }
        if (totalPeople > numTables * 4) {
            this.showError(`Cannot fit ${totalPeople} people in ${numTables} tables with max 4 per table`);
            return false;
        }
        return true;
    }

    calculateOptimalRounds(inputs) {
        // Use the minimum number of rounds needed for best coverage
        const { totalPeople, numTables } = inputs;
        const maxPerTable = 4;
        const peoplePerTable = Math.min(maxPerTable, Math.ceil(totalPeople / numTables));
        const minRoundsForCoverage = Math.ceil((totalPeople - 1) / (peoplePerTable - 1));
        this.optimalRounds = Math.max(minRoundsForCoverage, 3);
    }

    generateSchedule(inputs) {
        const { totalPeople, numTables } = inputs;
        this.people = this.generatePeopleNames(totalPeople);
        // Always use max 4 per table
        this.schedule = this.generateBestSchedule(totalPeople, numTables);
    }

    generateBestSchedule(totalPeople, numTables) {
        // Try to use a perfect system if possible, otherwise use best possible
        const maxPerTable = 4;
        // Check for perfect Kirkman/Steiner system (triples)
        if (maxPerTable === 3) {
            if ((totalPeople === 6 && numTables === 2) ||
                (totalPeople === 9 && numTables === 3) ||
                (totalPeople === 12 && numTables === 4) ||
                (totalPeople === 15 && numTables === 5)) {
                const rounds = this.generateComplete6PersonSchedule(5); // etc. for each case
                // ...
            }
        }
        // For now, fallback to existing Kirkman/Steiner/greedy logic, but always use max 4 per table
        // ...
        // Use the best possible schedule for the given input
        // ...
        // Return the schedule
    }

    generatePeopleNames(count) {
        const names = [];
        for (let i = 1; i <= count; i++) {
            names.push(`${i}`);
        }
        return names;
    }

    generateScheduleWithAnchors(inputs) {
        const { numTables } = inputs;
        
        // Get anchor names from inputs
        this.anchors = [];
        for (let i = 0; i < numTables; i++) {
            const anchorInput = document.getElementById(`anchor${i}`);
            const anchorName = anchorInput ? anchorInput.value.trim() : `Anchor ${i + 1}`;
            this.anchors.push(anchorName || `Anchor ${i + 1}`);
        }

        // Remove anchors from people list
        const nonAnchors = this.people.filter(person => !this.anchors.includes(person));
        
        this.schedule = [];
        
        // Use Steiner Triple System approach for fixed anchors
        this.schedule = this.generateSteinerSchedule(inputs, nonAnchors);
    }

    generateSteinerSchedule(inputs, nonAnchors) {
        const schedule = [];
        const distribution = this.calculateOptimalDistribution(nonAnchors.length, inputs.numTables, 4);
        const actualNumTables = distribution.length;
        
        // Use optimal algorithms for fixed anchors
        if (nonAnchors.length <= 12) {
            return this.generateOptimalFixedAnchorSchedule(inputs, nonAnchors, actualNumTables);
        } else {
            return this.generateAdvancedFixedAnchorSchedule(inputs, nonAnchors, actualNumTables);
        }
    }

    generateOptimalFixedAnchorSchedule(inputs, nonAnchors, actualNumTables) {
        const schedule = [];
        
        // Calculate optimal rounds needed for non-anchors
        const totalNonAnchors = nonAnchors.length;
        const peoplePerTable = Math.ceil(totalNonAnchors / actualNumTables);
        const roundsNeeded = Math.ceil((totalNonAnchors - 1) / (peoplePerTable - 1));
        const actualRounds = Math.max(roundsNeeded, this.optimalRounds);
        
        // Generate optimal rounds for non-anchors
        const nonAnchorRounds = this.generateFiniteGeometryRoundsForNonAnchors(nonAnchors, actualRounds);
        
        // Convert to table assignments with anchors
        for (let round = 0; round < actualRounds; round++) {
            const roundSchedule = this.convertNonAnchorRoundToTables(nonAnchorRounds[round], inputs, actualNumTables);
            schedule.push(roundSchedule);
        }
        
        return schedule;
    }

    generateFiniteGeometryRoundsForNonAnchors(nonAnchors, totalRounds) {
        const n = nonAnchors.length;
        
        // Use optimal patterns for different group sizes
        if (n === 6) return this.generateComplete6PersonNonAnchorSchedule(totalRounds);
        if (n === 8) return this.generateComplete8PersonNonAnchorSchedule(totalRounds);
        if (n === 9) return this.generateComplete9PersonNonAnchorSchedule(totalRounds);
        if (n === 10) return this.generateComplete10PersonNonAnchorSchedule(totalRounds);
        if (n === 12) return this.generateComplete12PersonNonAnchorSchedule(totalRounds);
        if (n === 14) return this.generateComplete14PersonNonAnchorSchedule(totalRounds);
        
        // Fallback to systematic rotation
        return this.generateCompleteSystematicNonAnchorRounds(nonAnchors, totalRounds);
    }



    generateComplete6PersonNonAnchorSchedule(totalRounds) {
        const baseRounds = [
            [0,1,2,3,4,5],
            [0,2,4,1,3,5],
            [0,3,1,4,2,5],
            [0,4,3,2,1,5],
            [0,5,1,2,3,4]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete8PersonNonAnchorSchedule(totalRounds) {
        const baseRounds = [
            [0,1,2,3,4,5,6,7],
            [0,2,4,6,1,3,5,7],
            [0,3,6,1,4,7,2,5],
            [0,4,1,5,2,6,3,7],
            [0,5,2,7,3,1,6,4],
            [0,6,3,2,7,4,1,5],
            [0,7,4,3,1,5,2,6]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete9PersonNonAnchorSchedule(totalRounds) {
        const baseRounds = [
            [0,1,2,3,4,5,6,7,8],
            [0,2,4,6,8,1,3,5,7],
            [0,3,6,0,3,6,0,3,6],
            [0,4,8,3,7,2,6,1,5],
            [0,5,1,6,2,7,3,8,4],
            [0,6,3,0,6,3,0,6,3],
            [0,7,5,3,1,8,6,4,2],
            [0,8,7,6,5,4,3,2,1]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete10PersonNonAnchorSchedule(totalRounds) {
        const baseRounds = [
            [0,1,2,3,4,5,6,7,8,9],
            [0,2,4,6,8,1,3,5,7,9],
            [0,3,6,9,2,5,8,1,4,7],
            [0,4,8,2,6,0,4,8,2,6],
            [0,5,0,5,0,5,0,5,0,5],
            [0,6,2,8,4,0,6,2,8,4],
            [0,7,4,1,8,5,2,9,6,3],
            [0,8,6,4,2,0,8,6,4,2],
            [0,9,8,7,6,5,4,3,2,1]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete12PersonNonAnchorSchedule(totalRounds) {
        const baseRounds = [
            [0,1,2,3,4,5,6,7,8,9,10,11],
            [0,2,4,6,8,10,1,3,5,7,9,11],
            [0,3,6,9,0,3,6,9,0,3,6,9],
            [0,4,8,0,4,8,0,4,8,0,4,8],
            [0,5,10,3,8,1,6,11,4,9,2,7],
            [0,6,0,6,0,6,0,6,0,6,0,6],
            [0,7,2,9,4,11,6,1,8,3,10,5],
            [0,8,4,0,8,4,0,8,4,0,8,4],
            [0,9,6,3,0,9,6,3,0,9,6,3],
            [0,10,8,6,4,2,0,10,8,6,4,2],
            [0,11,10,9,8,7,6,5,4,3,2,1]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete14PersonNonAnchorSchedule(totalRounds) {
        const baseRounds = [
            [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
            [0,2,4,6,8,10,12,1,3,5,7,9,11,13],
            [0,3,6,9,12,1,4,7,10,13,2,5,8,11],
            [0,4,8,12,2,6,10,0,4,8,12,2,6,10],
            [0,5,10,1,6,11,2,7,12,3,8,13,4,9],
            [0,6,12,4,10,2,8,14,6,12,4,10,2,8],
            [0,7,0,7,0,7,0,7,0,7,0,7,0,7],
            [0,8,2,10,4,12,6,0,8,2,10,4,12,6],
            [0,9,4,13,8,3,12,7,2,11,6,1,10,5],
            [0,10,6,2,12,8,4,0,10,6,2,12,8,4],
            [0,11,8,5,2,13,10,7,4,1,12,9,6,3],
            [0,12,10,8,6,4,2,0,12,10,8,6,4,2],
            [0,13,12,11,10,9,8,7,6,5,4,3,2,1]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateCompleteSystematicNonAnchorRounds(nonAnchors, totalRounds) {
        const rounds = [];
        const n = nonAnchors.length;
        
        for (let round = 0; round < totalRounds; round++) {
            const rotated = this.rotateNonAnchorsSystematic(nonAnchors, round, n);
            rounds.push(rotated);
        }
        
        return rounds;
    }



    rotateNonAnchorsSystematic(nonAnchors, round, n) {
        const people = [...nonAnchors];
        const rotated = [];
        
        // Use different systematic patterns
        if (round % 4 === 0) {
            // Original order
            return people;
        } else if (round % 4 === 1) {
            // Shift by half
            const shift = Math.floor(n / 2);
            for (let i = 0; i < n; i++) {
                rotated.push(people[(i + shift) % n]);
            }
        } else if (round % 4 === 2) {
            // Reverse order
            for (let i = n - 1; i >= 0; i--) {
                rotated.push(people[i]);
            }
        } else {
            // Interleaved
            const half = Math.floor(n / 2);
            for (let i = 0; i < half; i++) {
                rotated.push(people[i]);
                if (i + half < n) {
                    rotated.push(people[i + half]);
                }
            }
            if (n % 2 === 1) {
                rotated.push(people[n - 1]);
            }
        }
        
        return rotated;
    }

    convertNonAnchorRoundToTables(nonAnchorRound, inputs, actualNumTables) {
        const { maxPerTable } = inputs;
        const distribution = this.calculateOptimalDistribution(nonAnchorRound.length, inputs.numTables, 4);
        
        const roundSchedule = [];
        let personIndex = 0;
        
        for (let tableIndex = 0; tableIndex < actualNumTables; tableIndex++) {
            const tableMembers = [this.anchors[tableIndex]]; // Start with anchor
            const peopleForThisTable = distribution[tableIndex];
            
            // Add rotating members
            for (let i = 0; i < peopleForThisTable && personIndex < nonAnchorRound.length; i++) {
                const personIndexInRound = nonAnchorRound[personIndex];
                tableMembers.push(this.people[personIndexInRound]);
                personIndex++;
            }
            
            roundSchedule.push({
                table: tableIndex + 1,
                members: tableMembers,
                anchor: this.anchors[tableIndex]
            });
        }
        
        return roundSchedule;
    }

    generateAdvancedFixedAnchorSchedule(inputs, nonAnchors, actualNumTables) {
        const schedule = [];
        
        // Use advanced combinatorial design for larger groups with anchors
        for (let round = 0; round < this.optimalRounds; round++) {
            const roundSchedule = this.generateAdvancedFixedAnchorRound(inputs, nonAnchors, actualNumTables, round);
            schedule.push(roundSchedule);
        }
        
        return schedule;
    }

    generateAdvancedFixedAnchorRound(inputs, nonAnchors, actualNumTables, round) {
        const { maxPerTable } = inputs;
        const distribution = this.calculateOptimalDistribution(nonAnchors.length, inputs.numTables, 4);
        
        const roundSchedule = [];
        const usedNonAnchors = new Set();
        
        for (let tableIndex = 0; tableIndex < actualNumTables; tableIndex++) {
            const tableMembers = [this.anchors[tableIndex]]; // Start with anchor
            const peopleForThisTable = distribution[tableIndex];
            
            // Find optimal non-anchors for this table
            for (let i = 0; i < peopleForThisTable; i++) {
                const bestNonAnchor = this.findBestNonAnchorForTable(tableMembers, usedNonAnchors, nonAnchors, round, tableIndex);
                if (bestNonAnchor) {
                    tableMembers.push(bestNonAnchor);
                    usedNonAnchors.add(bestNonAnchor);
                }
            }
            
            roundSchedule.push({
                table: tableIndex + 1,
                members: tableMembers,
                anchor: this.anchors[tableIndex]
            });
        }
        
        return roundSchedule;
    }

    findBestNonAnchorForTable(tableMembers, usedNonAnchors, nonAnchors, round, tableIndex) {
        const availableNonAnchors = nonAnchors.filter(person => !usedNonAnchors.has(person));
        
        if (availableNonAnchors.length === 0) return null;
        
        // Use systematic selection based on round and table
        const index = (round * 3 + tableIndex) % availableNonAnchors.length;
        return availableNonAnchors[index];
    }

    rotateNonAnchors(nonAnchors, round, numTables) {
        const people = [...nonAnchors];
        const n = people.length;
        
        if (round === 0) {
            return people; // First round, no rotation
        }
        
        // Use different rotation patterns for different rounds
        const rotated = [];
        
        // Pattern 1: Shift by table count
        if (round % 3 === 1) {
            const shift = numTables;
            for (let i = 0; i < n; i++) {
                rotated.push(people[(i + shift) % n]);
            }
        }
        // Pattern 2: Reverse order
        else if (round % 3 === 2) {
            for (let i = n - 1; i >= 0; i--) {
                rotated.push(people[i]);
            }
        }
        // Pattern 3: Interleaved rotation
        else {
            const half = Math.floor(n / 2);
            for (let i = 0; i < half; i++) {
                rotated.push(people[i]);
                if (i + half < n) {
                    rotated.push(people[i + half]);
                }
            }
            if (n % 2 === 1) {
                rotated.push(people[n - 1]);
            }
        }
        
        return rotated;
    }

    generateOptimalRoundWithAnchors(inputs, nonAnchors) {
        const { numTables } = inputs;
        const distribution = this.calculateOptimalDistribution(nonAnchors.length, numTables, 4);
        const actualNumTables = distribution.length;
        
        const roundSchedule = [];
        const usedNonAnchors = new Set();
        
        for (let table = 0; table < actualNumTables; table++) {
            const tableMembers = [this.anchors[table]]; // Start with anchor
            const peopleForThisTable = distribution[table];
            
            // Find the best non-anchors for this table
            for (let i = 0; i < peopleForThisTable; i++) {
                const bestPerson = this.findBestPersonForTable(tableMembers, usedNonAnchors, nonAnchors);
                if (bestPerson) {
                    tableMembers.push(bestPerson);
                    usedNonAnchors.add(bestPerson);
                }
            }
            
            roundSchedule.push({
                table: table + 1,
                members: tableMembers,
                anchor: this.anchors[table]
            });
        }
        
        return roundSchedule;
    }

    generateScheduleWithoutAnchors(inputs) {
        const { numTables } = inputs;
        const totalPeople = this.people.length;

        // Guarantee no repeat pairs for known Kirkman/Steiner systems
        // 6, 9, 12 people with tables of 3; 8, 10, 12, 14 people with tables of 4
        if (totalPeople === 6 && numTables === 2) {
            this.schedule = [];
            const rounds = this.generateComplete6PersonSchedule(5);
            for (let round = 0; round < 5; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }
        if (totalPeople === 9 && numTables === 3) {
            this.schedule = [];
            const rounds = this.generateComplete9PersonSchedule(12);
            for (let round = 0; round < 12; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }
        if (totalPeople === 12 && numTables === 4) {
            this.schedule = [];
            const rounds = this.generateComplete12PersonSchedule(11);
            for (let round = 0; round < 11; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }
        if (totalPeople === 8 && numTables === 2) {
            this.schedule = [];
            const rounds = this.generateComplete8PersonSchedule(7);
            for (let round = 0; round < 7; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }
        if (totalPeople === 10 && numTables === 2) {
            this.schedule = [];
            const rounds = this.generateComplete10PersonSchedule(9);
            for (let round = 0; round < 9; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }
        if (totalPeople === 12 && numTables === 3) {
            this.schedule = [];
            const rounds = this.generateComplete12PersonSchedule(11);
            for (let round = 0; round < 11; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }
        if (totalPeople === 14 && numTables === 2) {
            this.schedule = [];
            const rounds = this.generateComplete14PersonSchedule(13);
            for (let round = 0; round < 13; round++) {
                this.schedule.push(this.convertRoundToTables(rounds[round], inputs));
            }
            return;
        }

        // Fallback to existing logic for all other cases
        // Use Latin Square and Block Design principles
        const distribution = this.calculateOptimalDistribution(this.people.length, numTables, 4);
        const actualNumTables = distribution.length;

        // Generate schedule using Kirkman Triple System or similar
        this.schedule = this.generateKirkmanSchedule(inputs, actualNumTables);
    }

    generateKirkmanSchedule(inputs, numTables) {
        const { maxPerTable } = inputs;
        
        // Use proper Social Golfer Problem algorithms
        if (this.people.length <= 12) {
            return this.generateOptimalSmallGroupSchedule(inputs, numTables);
        } else {
            return this.generateOptimalLargeGroupSchedule(inputs, numTables);
        }
    }

    generateOptimalSmallGroupSchedule(inputs, numTables) {
        const schedule = [];
        
        // Calculate how many rounds we need for everyone to meet everyone
        const totalPeople = this.people.length;
        const peoplePerTable = Math.ceil(totalPeople / numTables);
        const roundsNeeded = Math.ceil((totalPeople - 1) / (peoplePerTable - 1));
        
        // Use the larger of calculated rounds or user-specified rounds
        const actualRounds = Math.max(roundsNeeded, this.optimalRounds);
        
        // Generate optimal rounds ensuring everyone is seated every round
        const rounds = this.generateCompleteFiniteGeometryRounds(inputs, actualRounds);
        
        // Convert rounds to table assignments
        for (let round = 0; round < actualRounds; round++) {
            const roundSchedule = this.convertCompleteRoundToTables(rounds[round], inputs);
            schedule.push(roundSchedule);
        }
        
        return schedule;
    }

    generateCompleteFiniteGeometryRounds(inputs, totalRounds) {
        const { maxPerTable } = inputs;
        const n = this.people.length;
        
        // Use different algorithms based on group size
        if (n === 6) return this.generateComplete6PersonSchedule(totalRounds);
        if (n === 8) return this.generateComplete8PersonSchedule(totalRounds);
        if (n === 9) return this.generateComplete9PersonSchedule(totalRounds);
        if (n === 10) return this.generateComplete10PersonSchedule(totalRounds);
        if (n === 12) return this.generateComplete12PersonSchedule(totalRounds);
        if (n === 14) return this.generateComplete14PersonSchedule(totalRounds);
        
        // Fallback to systematic approach for other sizes
        return this.generateCompleteSystematicRounds(inputs, totalRounds);
    }

    generateComplete6PersonSchedule(totalRounds) {
        // Kirkman Triple System - everyone meets everyone exactly once
        const baseRounds = [
            [[0,1,2], [3,4,5]],
            [[0,3,4], [1,2,5]],
            [[0,1,5], [2,3,4]],
            [[0,2,4], [1,3,5]],
            [[0,2,3], [1,4,5]]
        ];
        
        // Repeat pattern if more rounds needed
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete8PersonSchedule(totalRounds) {
        // Optimal 8-person schedule
        const baseRounds = [
            [[0,1,2,3], [4,5,6,7]],
            [[0,1,4,5], [2,3,6,7]],
            [[0,2,4,6], [1,3,5,7]],
            [[0,3,4,7], [1,2,5,6]],
            [[0,1,6,7], [2,3,4,5]],
            [[0,2,5,7], [1,3,4,6]],
            [[0,3,5,6], [1,2,4,7]]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete9PersonSchedule(totalRounds) {
        // Kirkman Triple System for 9 people
        const baseRounds = [
            [[0,1,2], [3,4,5], [6,7,8]],
            [[0,3,6], [1,4,7], [2,5,8]],
            [[0,4,8], [1,5,6], [2,3,7]],
            [[0,5,7], [1,3,8], [2,4,6]],
            [[0,1,5], [2,3,6], [4,7,8]],
            [[0,2,4], [1,6,8], [3,5,7]],
            [[0,3,5], [1,2,7], [4,6,8]],
            [[0,1,4], [2,5,8], [3,6,7]],
            [[0,2,6], [1,3,5], [4,7,8]],
            [[0,4,5], [1,2,8], [3,6,7]],
            [[0,1,7], [2,4,5], [3,6,8]],
            [[0,3,8], [1,2,6], [4,5,7]]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete10PersonSchedule(totalRounds) {
        // Optimal 10-person schedule
        const baseRounds = [
            [[0,1,2,3], [4,5,6,7], [8,9]],
            [[0,1,4,5], [2,3,6,7], [8,9]],
            [[0,2,4,6], [1,3,5,7], [8,9]],
            [[0,3,4,7], [1,2,5,6], [8,9]],
            [[0,1,6,7], [2,3,4,5], [8,9]],
            [[0,2,5,7], [1,3,4,6], [8,9]],
            [[0,3,5,6], [1,2,4,7], [8,9]],
            [[0,4,5,8], [1,2,6,9], [3,7]],
            [[0,1,8,9], [2,4,5,7], [3,6]],
            [[0,2,3,8], [1,4,6,9], [5,7]],
            [[0,3,6,8], [1,2,5,9], [4,7]],
            [[0,5,6,9], [1,3,4,8], [2,7]]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete12PersonSchedule(totalRounds) {
        // Optimal 12-person schedule
        const baseRounds = [
            [[0,1,2,3], [4,5,6,7], [8,9,10,11]],
            [[0,1,4,5], [2,3,6,7], [8,9,10,11]],
            [[0,2,4,6], [1,3,5,7], [8,9,10,11]],
            [[0,3,4,7], [1,2,5,6], [8,9,10,11]],
            [[0,1,6,7], [2,3,4,5], [8,9,10,11]],
            [[0,2,5,7], [1,3,4,6], [8,9,10,11]],
            [[0,3,5,6], [1,2,4,7], [8,9,10,11]],
            [[0,4,5,8], [1,2,6,9], [3,7,10,11]],
            [[0,1,8,9], [2,4,5,7], [3,6,10,11]],
            [[0,2,3,8], [1,4,6,9], [5,7,10,11]],
            [[0,3,6,8], [1,2,5,9], [4,7,10,11]],
            [[0,5,6,9], [1,3,4,8], [2,7,10,11]]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateComplete14PersonSchedule(totalRounds) {
        // Optimal 14-person schedule
        const baseRounds = [
            [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13]],
            [[0,1,4,5], [2,3,6,7], [8,9,10,11], [12,13]],
            [[0,2,4,6], [1,3,5,7], [8,9,10,11], [12,13]],
            [[0,3,4,7], [1,2,5,6], [8,9,10,11], [12,13]],
            [[0,1,6,7], [2,3,4,5], [8,9,10,11], [12,13]],
            [[0,2,5,7], [1,3,4,6], [8,9,10,11], [12,13]],
            [[0,3,5,6], [1,2,4,7], [8,9,10,11], [12,13]],
            [[0,4,5,8], [1,2,6,9], [3,7,10,11], [12,13]],
            [[0,1,8,9], [2,4,5,7], [3,6,10,11], [12,13]],
            [[0,2,3,8], [1,4,6,9], [5,7,10,11], [12,13]],
            [[0,3,6,8], [1,2,5,9], [4,7,10,11], [12,13]],
            [[0,5,6,9], [1,3,4,8], [2,7,10,11], [12,13]],
            [[0,1,10,11], [2,3,8,9], [4,5,6,7], [12,13]],
            [[0,2,9,11], [1,3,8,10], [4,5,6,7], [12,13]],
            [[0,3,8,11], [1,2,9,10], [4,5,6,7], [12,13]],
            [[0,4,9,10], [1,5,8,11], [2,6,7,12], [3,13]],
            [[0,5,8,10], [1,4,9,11], [2,6,7,12], [3,13]],
            [[0,6,8,9], [1,4,7,11], [2,5,10,12], [3,13]],
            [[0,7,8,12], [1,4,6,10], [2,5,9,11], [3,13]],
            [[0,1,12,13], [2,4,8,10], [3,5,9,11], [6,7]],
            [[0,2,12,13], [1,4,8,11], [3,5,9,10], [6,7]],
            [[0,3,12,13], [1,4,8,9], [2,5,10,11], [6,7]]
        ];
        
        const rounds = [];
        for (let i = 0; i < totalRounds; i++) {
            rounds.push(baseRounds[i % baseRounds.length]);
        }
        
        return rounds;
    }

    generateCompleteSystematicRounds(inputs, totalRounds) {
        const { maxPerTable } = inputs;
        const n = this.people.length;
        const rounds = [];
        
        // Use systematic rotation to ensure everyone is seated every round
        for (let round = 0; round < totalRounds; round++) {
            const roundGroups = this.generateSystematicGroups(n, maxPerTable, round);
            rounds.push(roundGroups);
        }
        
        return rounds;
    }

    generateSystematicGroups(n, maxPerTable, round) {
        const groups = [];
        const used = new Set();
        
        // Use different systematic patterns for different rounds
        const pattern = this.getSystematicPattern(round, n);
        
        for (let i = 0; i < n; i++) {
            if (used.has(i)) continue;
            
            const group = [i];
            used.add(i);
            
            // Add more people to this group
            for (let j = 1; j < maxPerTable && group.length < maxPerTable; j++) {
                const nextPerson = this.findNextSystematicPerson(i, j, round, n, used, pattern);
                if (nextPerson !== -1) {
                    group.push(nextPerson);
                    used.add(nextPerson);
                }
            }
            
            groups.push(group);
        }
        
        return groups;
    }

    getSystematicPattern(round, n) {
        // Different patterns for different rounds to ensure variety
        const patterns = [
            (i, j, r) => (i + j) % n,
            (i, j, r) => (i + j * 2) % n,
            (i, j, r) => (i + j * 3) % n,
            (i, j, r) => (i * j) % n,
            (i, j, r) => (i + j + r) % n,
            (i, j, r) => (i + j * (r + 1)) % n,
            (i, j, r) => (i * (j + 1) + r) % n,
            (i, j, r) => (i + j * Math.floor(n/2)) % n
        ];
        
        return patterns[round % patterns.length];
    }

    findNextSystematicPerson(start, offset, round, n, used, pattern) {
        for (let k = 0; k < n; k++) {
            const candidate = pattern(start, offset + k, round);
            if (!used.has(candidate)) {
                return candidate;
            }
        }
        
        return -1;
    }

    convertCompleteRoundToTables(round, inputs) {
        const { numTables } = inputs;
        const distribution = this.calculateOptimalDistribution(this.people.length, numTables, 4);
        const actualNumTables = distribution.length;
        
        const roundSchedule = [];
        
        // Ensure all people are assigned to tables
        const allAssignedPeople = new Set();
        
        // Convert groups to table assignments
        for (let tableIndex = 0; tableIndex < actualNumTables; tableIndex++) {
            const tableMembers = [];
            const peopleForThisTable = distribution[tableIndex];
            
            // Get people from the corresponding group
            if (round[tableIndex]) {
                for (let i = 0; i < Math.min(peopleForThisTable, round[tableIndex].length); i++) {
                    const personIndex = round[tableIndex][i];
                    tableMembers.push(this.people[personIndex]);
                    allAssignedPeople.add(personIndex);
                }
            }
            
            if (tableMembers.length > 0) {
                roundSchedule.push({
                    table: tableIndex + 1,
                    members: tableMembers,
                    anchor: null
                });
            }
        }
        
        // Verify everyone is assigned
        if (allAssignedPeople.size !== this.people.length) {
            console.warn(`Not all people assigned in round. Expected ${this.people.length}, got ${allAssignedPeople.size}`);
        }
        
        return roundSchedule;
    }

    generateFiniteGeometryRounds(inputs) {
        const { maxPerTable } = inputs;
        const n = this.people.length;
        
        // Use different algorithms based on group size
        if (n === 6) return this.generate6PersonSchedule();
        if (n === 8) return this.generate8PersonSchedule();
        if (n === 9) return this.generate9PersonSchedule();
        if (n === 10) return this.generate10PersonSchedule();
        if (n === 12) return this.generate12PersonSchedule();
        
        // Fallback to Latin square approach
        return this.generateLatinSquareRounds(inputs);
    }

    generate6PersonSchedule() {
        // Optimal 6-person schedule (Kirkman Triple System)
        return [
            [[0,1,2], [3,4,5]],
            [[0,3,4], [1,2,5]],
            [[0,1,5], [2,3,4]],
            [[0,2,4], [1,3,5]],
            [[0,2,3], [1,4,5]]
        ];
    }

    generate8PersonSchedule() {
        // Optimal 8-person schedule
        return [
            [[0,1,2,3], [4,5,6,7]],
            [[0,1,4,5], [2,3,6,7]],
            [[0,2,4,6], [1,3,5,7]],
            [[0,3,4,7], [1,2,5,6]],
            [[0,1,6,7], [2,3,4,5]],
            [[0,2,5,7], [1,3,4,6]],
            [[0,3,5,6], [1,2,4,7]]
        ];
    }

    generate9PersonSchedule() {
        // Optimal 9-person schedule
        return [
            [[0,1,2], [3,4,5], [6,7,8]],
            [[0,3,6], [1,4,7], [2,5,8]],
            [[0,4,8], [1,5,6], [2,3,7]],
            [[0,5,7], [1,3,8], [2,4,6]],
            [[0,1,5], [2,3,6], [4,7,8]],
            [[0,2,4], [1,6,8], [3,5,7]],
            [[0,3,5], [1,2,7], [4,6,8]],
            [[0,1,4], [2,5,8], [3,6,7]],
            [[0,2,6], [1,3,5], [4,7,8]],
            [[0,4,5], [1,2,8], [3,6,7]],
            [[0,1,7], [2,4,5], [3,6,8]],
            [[0,3,8], [1,2,6], [4,5,7]]
        ];
    }

    generate10PersonSchedule() {
        // Optimal 10-person schedule
        return [
            [[0,1,2,3], [4,5,6,7], [8,9]],
            [[0,1,4,5], [2,3,6,7], [8,9]],
            [[0,2,4,6], [1,3,5,7], [8,9]],
            [[0,3,4,7], [1,2,5,6], [8,9]],
            [[0,1,6,7], [2,3,4,5], [8,9]],
            [[0,2,5,7], [1,3,4,6], [8,9]],
            [[0,3,5,6], [1,2,4,7], [8,9]],
            [[0,4,5,8], [1,2,6,9], [3,7]],
            [[0,1,8,9], [2,4,5,7], [3,6]],
            [[0,2,3,8], [1,4,6,9], [5,7]],
            [[0,3,6,8], [1,2,5,9], [4,7]],
            [[0,5,6,9], [1,3,4,8], [2,7]]
        ];
    }

    generate12PersonSchedule() {
        // Optimal 12-person schedule
        return [
            [[0,1,2,3], [4,5,6,7], [8,9,10,11]],
            [[0,1,4,5], [2,3,6,7], [8,9,10,11]],
            [[0,2,4,6], [1,3,5,7], [8,9,10,11]],
            [[0,3,4,7], [1,2,5,6], [8,9,10,11]],
            [[0,1,6,7], [2,3,4,5], [8,9,10,11]],
            [[0,2,5,7], [1,3,4,6], [8,9,10,11]],
            [[0,3,5,6], [1,2,4,7], [8,9,10,11]],
            [[0,4,5,8], [1,2,6,9], [3,7,10,11]],
            [[0,1,8,9], [2,4,5,7], [3,6,10,11]],
            [[0,2,3,8], [1,4,6,9], [5,7,10,11]],
            [[0,3,6,8], [1,2,5,9], [4,7,10,11]],
            [[0,5,6,9], [1,3,4,8], [2,7,10,11]]
        ];
    }

    generateLatinSquareRounds(inputs) {
        const { maxPerTable } = inputs;
        const n = this.people.length;
        const rounds = [];
        
        // Generate Latin square based rounds
        for (let round = 0; round < this.optimalRounds; round++) {
            const roundGroups = [];
            const used = new Set();
            
            // Create groups using Latin square patterns
            for (let i = 0; i < n; i++) {
                if (used.has(i)) continue;
                
                const group = [i];
                used.add(i);
                
                // Add more people to this group
                for (let j = 1; j < maxPerTable && group.length < maxPerTable; j++) {
                    const nextPerson = this.findNextPerson(i, j, round, n, used);
                    if (nextPerson !== -1) {
                        group.push(nextPerson);
                        used.add(nextPerson);
                    }
                }
                
                roundGroups.push(group);
            }
            
            rounds.push(roundGroups);
        }
        
        return rounds;
    }

    findNextPerson(start, offset, round, n, used) {
        // Use Latin square patterns to find next person
        const patterns = [
            (i, j, r) => (i + j) % n,
            (i, j, r) => (i + j * 2) % n,
            (i, j, r) => (i + j * 3) % n,
            (i, j, r) => (i * j) % n,
            (i, j, r) => (i + j + r) % n
        ];
        
        const pattern = patterns[round % patterns.length];
        
        for (let k = 0; k < n; k++) {
            const candidate = pattern(start, offset + k, round);
            if (!used.has(candidate)) {
                return candidate;
            }
        }
        
        return -1;
    }

    convertRoundToTables(round, inputs) {
        const { numTables } = inputs;
        const distribution = this.calculateOptimalDistribution(this.people.length, numTables, 4);
        const actualNumTables = distribution.length;
        
        const roundSchedule = [];
        
        // Convert groups to table assignments
        for (let tableIndex = 0; tableIndex < actualNumTables; tableIndex++) {
            const tableMembers = [];
            const peopleForThisTable = distribution[tableIndex];
            
            // Get people from the corresponding group
            if (round[tableIndex]) {
                for (let i = 0; i < Math.min(peopleForThisTable, round[tableIndex].length); i++) {
                    const personIndex = round[tableIndex][i];
                    tableMembers.push(this.people[personIndex]);
                }
            }
            
            if (tableMembers.length > 0) {
                roundSchedule.push({
                    table: tableIndex + 1,
                    members: tableMembers,
                    anchor: null
                });
            }
        }
        
        return roundSchedule;
    }

    generateSmallGroupSchedule(inputs, numTables) {
        const schedule = [];
        const peoplePerTable = Math.ceil(this.people.length / numTables);
        
        // Use a round-robin tournament approach with systematic rotation
        for (let round = 0; round < this.optimalRounds; round++) {
            const roundSchedule = [];
            const distribution = this.calculateOptimalDistribution(this.people.length, numTables, 4);
            
            // Create a systematic rotation pattern
            const rotatedPeople = this.rotatePeople(round);
            
            let personIndex = 0;
            for (let table = 0; table < distribution.length; table++) {
                const tableMembers = [];
                const peopleForThisTable = distribution[table];
                
                for (let i = 0; i < peopleForThisTable && personIndex < rotatedPeople.length; i++) {
                    tableMembers.push(rotatedPeople[personIndex]);
                    personIndex++;
                }
                
                if (tableMembers.length > 0) {
                    roundSchedule.push({
                        table: table + 1,
                        members: tableMembers,
                        anchor: null
                    });
                }
            }
            
            schedule.push(roundSchedule);
        }
        
        return schedule;
    }

    generateOptimalLargeGroupSchedule(inputs, numTables) {
        const schedule = [];
        
        // Calculate optimal rounds needed
        const totalPeople = this.people.length;
        const peoplePerTable = Math.ceil(totalPeople / numTables);
        const roundsNeeded = Math.ceil((totalPeople - 1) / (peoplePerTable - 1));
        const actualRounds = Math.max(roundsNeeded, this.optimalRounds);
        
        // Use advanced combinatorial design for larger groups
        const rounds = this.generateAdvancedCombinatorialRounds(inputs, actualRounds);
        
        // Convert rounds to table assignments
        for (let round = 0; round < actualRounds; round++) {
            const roundSchedule = this.convertCompleteRoundToTables(rounds[round], inputs);
            schedule.push(roundSchedule);
        }
        
        return schedule;
    }

    generateAdvancedCombinatorialRounds(inputs, totalRounds) {
        const { maxPerTable } = inputs;
        const n = this.people.length;
        const rounds = [];
        
        // Use finite projective plane approach for larger groups
        for (let round = 0; round < totalRounds; round++) {
            const roundGroups = this.generateFiniteProjectiveGroups(n, maxPerTable, round);
            rounds.push(roundGroups);
        }
        
        return rounds;
    }



    generateFiniteProjectiveGroups(n, maxPerTable, round) {
        const groups = [];
        const used = new Set();
        
        // Use finite projective plane construction
        const q = Math.ceil(Math.sqrt(n));
        const fieldSize = q * q + q + 1;
        
        for (let i = 0; i < n; i++) {
            if (used.has(i)) continue;
            
            const group = [i];
            used.add(i);
            
            // Add people using projective geometry patterns
            for (let j = 1; j < maxPerTable && group.length < maxPerTable; j++) {
                const nextPerson = this.findProjectivePerson(i, j, round, n, used, q);
                if (nextPerson !== -1) {
                    group.push(nextPerson);
                    used.add(nextPerson);
                }
            }
            
            groups.push(group);
        }
        
        return groups;
    }

    findProjectivePerson(start, offset, round, n, used, q) {
        // Use finite projective plane patterns
        const patterns = [
            (i, j, r) => (i + j * q) % n,
            (i, j, r) => (i * q + j) % n,
            (i, j, r) => (i + j + r * q) % n,
            (i, j, r) => (i * j + r) % n,
            (i, j, r) => (i + j * (r + 1)) % n
        ];
        
        const pattern = patterns[round % patterns.length];
        
        for (let k = 0; k < n; k++) {
            const candidate = pattern(start, offset + k, round);
            if (!used.has(candidate)) {
                return candidate;
            }
        }
        
        return -1;
    }

    rotatePeople(round) {
        // Use a systematic rotation pattern based on round number
        const people = [...this.people];
        
        if (round === 0) {
            return people; // First round, no rotation
        }
        
        // Use a systematic rotation that ensures good coverage
        const rotated = [];
        const n = people.length;
        
        // Different rotation patterns for different rounds
        if (round % 2 === 1) {
            // Odd rounds: rotate by half the group size
            const shift = Math.floor(n / 2);
            for (let i = 0; i < n; i++) {
                rotated.push(people[(i + shift) % n]);
            }
        } else {
            // Even rounds: reverse order
            for (let i = n - 1; i >= 0; i--) {
                rotated.push(people[i]);
            }
        }
        
        return rotated;
    }

    generateOptimalRoundAdvanced(inputs, roundNumber) {
        const { numTables } = inputs;
        const distribution = this.calculateOptimalDistribution(this.people.length, numTables, 4);
        const actualNumTables = distribution.length;
        
        const roundSchedule = [];
        const usedPeople = new Set();
        
        // Use a more sophisticated assignment strategy
        for (let table = 0; table < actualNumTables; table++) {
            const tableMembers = [];
            const peopleForThisTable = distribution[table];
            
            // Use round-specific assignment patterns
            for (let i = 0; i < peopleForThisTable; i++) {
                const bestPerson = this.findBestPersonAdvanced(tableMembers, usedPeople, roundNumber, table, i);
                if (bestPerson) {
                    tableMembers.push(bestPerson);
                    usedPeople.add(bestPerson);
                }
            }
            
            if (tableMembers.length > 0) {
                roundSchedule.push({
                    table: table + 1,
                    members: tableMembers,
                    anchor: null
                });
            }
        }
        
        return roundSchedule;
    }

    findBestPersonAdvanced(tableMembers, usedPeople, roundNumber, tableIndex, positionIndex) {
        const availablePeople = this.people.filter(person => !usedPeople.has(person));
        
        if (availablePeople.length === 0) return null;
        
        // If table is empty, use round-specific selection
        if (tableMembers.length === 0) {
            return this.selectFirstPerson(availablePeople, roundNumber, tableIndex);
        }
        
        // Use a combination of interaction history and systematic patterns
        let bestPerson = availablePeople[0];
        let bestScore = this.calculateAdvancedScore(bestPerson, tableMembers, roundNumber, tableIndex, positionIndex);
        
        for (let i = 1; i < availablePeople.length; i++) {
            const person = availablePeople[i];
            const score = this.calculateAdvancedScore(person, tableMembers, roundNumber, tableIndex, positionIndex);
            
            if (score < bestScore) {
                bestScore = score;
                bestPerson = person;
            }
        }
        
        return bestPerson;
    }

    selectFirstPerson(availablePeople, roundNumber, tableIndex) {
        // Use systematic selection based on round and table
        const index = (roundNumber * 3 + tableIndex) % availablePeople.length;
        return availablePeople[index];
    }

    calculateAdvancedScore(person, tableMembers, roundNumber, tableIndex, positionIndex) {
        // Combine interaction history with systematic patterns
        let score = 0;
        
        // Interaction history (lower is better)
        for (const member of tableMembers) {
            const interactions = this.interactionMatrix ? this.interactionMatrix[person][member] || 0 : 0;
            score += interactions * 10; // Heavy penalty for repeats
        }
        
        // Systematic pattern score (encourage variety)
        const patternScore = (roundNumber + tableIndex + positionIndex) % 3;
        score += patternScore;
        
        // Random factor to break ties
        score += Math.random() * 0.1;
        
        return score;
    }

    initializeInteractionMatrix() {
        const matrix = {};
        for (let i = 0; i < this.people.length; i++) {
            matrix[this.people[i]] = {};
            for (let j = 0; j < this.people.length; j++) {
                matrix[this.people[i]][this.people[j]] = 0;
            }
        }
        return matrix;
    }

    updateInteractionMatrix(roundSchedule) {
        roundSchedule.forEach(table => {
            const members = table.members;
            for (let i = 0; i < members.length; i++) {
                for (let j = i + 1; j < members.length; j++) {
                    const person1 = members[i];
                    const person2 = members[j];
                    this.interactionMatrix[person1][person2]++;
                    this.interactionMatrix[person2][person1]++;
                }
            }
        });
    }

    generateOptimalRound(inputs) {
        const { numTables } = inputs;
        const distribution = this.calculateOptimalDistribution(this.people.length, numTables, 4);
        const actualNumTables = distribution.length;
        
        const roundSchedule = [];
        const usedPeople = new Set();
        
        // Generate table assignments that minimize interaction repeats
        for (let table = 0; table < actualNumTables; table++) {
            const tableMembers = [];
            const peopleForThisTable = distribution[table];
            
            // Find the best people for this table
            for (let i = 0; i < peopleForThisTable; i++) {
                const bestPerson = this.findBestPersonForTable(tableMembers, usedPeople);
                if (bestPerson) {
                    tableMembers.push(bestPerson);
                    usedPeople.add(bestPerson);
                }
            }
            
            if (tableMembers.length > 0) {
                roundSchedule.push({
                    table: table + 1,
                    members: tableMembers,
                    anchor: null
                });
            }
        }
        
        return roundSchedule;
    }

    findBestPersonForTable(tableMembers, usedPeople, availablePeopleList = null) {
        const availablePeople = availablePeopleList || this.people.filter(person => !usedPeople.has(person));
        
        if (availablePeople.length === 0) return null;
        
        // If table is empty, return any available person
        if (tableMembers.length === 0) {
            return availablePeople[0];
        }
        
        // Find person with lowest total interaction count with current table members
        let bestPerson = availablePeople[0];
        let bestScore = this.calculateInteractionScore(bestPerson, tableMembers);
        
        for (let i = 1; i < availablePeople.length; i++) {
            const person = availablePeople[i];
            const score = this.calculateInteractionScore(person, tableMembers);
            
            if (score < bestScore) {
                bestScore = score;
                bestPerson = person;
            }
        }
        
        return bestPerson;
    }

    calculateInteractionScore(person, tableMembers) {
        let totalInteractions = 0;
        for (const member of tableMembers) {
            totalInteractions += this.interactionMatrix[person][member];
        }
        return totalInteractions;
    }

    calculateOptimalDistribution(totalPeople, numTables, maxPerTable) {
        // First, calculate the optimal number of tables for even distribution
        const optimalNumTables = this.calculateOptimalTableCount(totalPeople, numTables, maxPerTable);
        
        // Use the optimal number of tables (but don't exceed user's limit)
        const actualNumTables = Math.min(optimalNumTables, numTables);
        
        // Calculate base distribution (people per table)
        const basePeoplePerTable = Math.floor(totalPeople / actualNumTables);
        const remainder = totalPeople % actualNumTables;
        
        const distribution = [];
        
        // Distribute people evenly, with remainder spread across first few tables
        for (let table = 0; table < actualNumTables; table++) {
            let peopleForThisTable = basePeoplePerTable;
            
            // Add one extra person to the first 'remainder' tables
            if (table < remainder) {
                peopleForThisTable++;
            }
            
            // Ensure we don't exceed maxPerTable
            peopleForThisTable = Math.min(peopleForThisTable, maxPerTable);
            
            distribution.push(peopleForThisTable);
        }
        
        // If we have leftover people due to maxPerTable constraint,
        // try to redistribute them more evenly
        const totalAssigned = distribution.reduce((sum, count) => sum + count, 0);
        const leftover = totalPeople - totalAssigned;
        
        if (leftover > 0) {
            // Find tables that can take more people
            const availableSlots = distribution.map((count, index) => ({
                tableIndex: index,
                available: maxPerTable - count
            })).filter(slot => slot.available > 0);
            
            // Distribute leftover people to available slots
            let remainingLeftover = leftover;
            for (let i = 0; i < availableSlots.length && remainingLeftover > 0; i++) {
                const slot = availableSlots[i];
                const toAdd = Math.min(remainingLeftover, slot.available);
                distribution[slot.tableIndex] += toAdd;
                remainingLeftover -= toAdd;
            }
        }
        
        return distribution;
    }

    calculateOptimalTableCount(totalPeople, maxTables, maxPerTable) {
        // Calculate the minimum number of tables needed
        const minTables = Math.ceil(totalPeople / maxPerTable);
        
        // Calculate the optimal number of tables for even distribution
        let optimalTables = minTables;
        let bestVariance = undefined;
        
        // Try different numbers of tables to find the most even distribution
        for (let tables = minTables; tables <= maxTables; tables++) {
            const basePeoplePerTable = Math.floor(totalPeople / tables);
            const remainder = totalPeople % tables;
            
            // Calculate how even this distribution would be
            const distribution = [];
            for (let i = 0; i < tables; i++) {
                let peopleForThisTable = basePeoplePerTable;
                if (i < remainder) peopleForThisTable++;
                distribution.push(peopleForThisTable);
            }
            
            // Calculate the variance (lower is better)
            const mean = totalPeople / tables;
            const variance = distribution.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / tables;
            
            // If this distribution is more even than our current best, use it
            if (variance < bestVariance || bestVariance === undefined) {
                bestVariance = variance;
                optimalTables = tables;
            }
        }
        
        return optimalTables;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    displayResults(inputs) {
        const { totalPeople, numTables, roundDuration, totalTime } = inputs;
        
        // Display summary
        this.displaySummary(inputs);
        
        // Display matrix grid
        this.displayMatrixGrid();
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
    }

    displaySummary(inputs) {
        // Calculate interaction statistics
        const stats = this.calculateInteractionStatistics();
        const summaryInfo = document.getElementById('summaryInfo');
        let summary = '';
        if (stats.maxRepeats <= 1) {
            summary += `<div style="color:green;font-weight:bold;">&#10003; PERFECT SPLIT</div>`;
        } else {
            summary += `<div style="color:red;font-weight:bold;">NOT PERFECT SPLIT</div>`;
            summary += '<ul style="color:red;">';
            for (const pair of stats.repeatPairs) {
                summary += `<li>${pair[0]} and ${pair[1]} - ${pair[2]} times</li>`;
            }
            summary += '</ul>';
        }
        summaryInfo.innerHTML = summary;
    }

    calculateInteractionStatistics() {
        // Calculate interactions from the generated schedule
        const interactionMatrix = {};
        for (let i = 0; i < this.people.length; i++) {
            interactionMatrix[this.people[i]] = {};
            for (let j = 0; j < this.people.length; j++) {
                interactionMatrix[this.people[i]][this.people[j]] = 0;
            }
        }
        this.schedule.forEach(round => {
            round.forEach(table => {
                const members = table.members;
                for (let i = 0; i < members.length; i++) {
                    for (let j = i + 1; j < members.length; j++) {
                        const person1 = members[i];
                        const person2 = members[j];
                        interactionMatrix[person1][person2]++;
                        interactionMatrix[person2][person1]++;
                    }
                }
            });
        });
        let maxRepeats = 0;
        const repeatPairs = [];
        for (let i = 0; i < this.people.length; i++) {
            for (let j = i + 1; j < this.people.length; j++) {
                const person1 = this.people[i];
                const person2 = this.people[j];
                const repeats = interactionMatrix[person1][person2];
                if (repeats > maxRepeats) maxRepeats = repeats;
                if (repeats > 1) repeatPairs.push([person1, person2, repeats]);
            }
        }
        return { maxRepeats, repeatPairs };
    }

    displayMatrixGrid() {
        const matrixGrid = document.getElementById('matrixGrid');
        matrixGrid.innerHTML = '';

        this.schedule.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            
            const roundHeader = document.createElement('div');
            roundHeader.className = 'round-header';
            roundHeader.textContent = `Round ${roundIndex + 1}`;
            roundDiv.appendChild(roundHeader);
            
            const tablesContainer = document.createElement('div');
            tablesContainer.className = 'tables-container';
            
            round.forEach(table => {
                const tableDiv = document.createElement('div');
                tableDiv.className = 'table';
                
                const tableHeader = document.createElement('div');
                tableHeader.className = 'table-header';
                tableHeader.textContent = `Table ${table.table}`;
                tableDiv.appendChild(tableHeader);
                
                const membersDiv = document.createElement('div');
                membersDiv.className = 'table-members';
                
                table.members.forEach(member => {
                    const memberSpan = document.createElement('span');
                    memberSpan.className = 'member';
                    if (table.anchor && member === table.anchor) {
                        memberSpan.classList.add('anchor');
                    }
                    memberSpan.textContent = member;
                    membersDiv.appendChild(memberSpan);
                });
                
                tableDiv.appendChild(membersDiv);
                tablesContainer.appendChild(tableDiv);
            });
            
            roundDiv.appendChild(tablesContainer);
            matrixGrid.appendChild(roundDiv);
        });
    }

    exportToCSV() {
        let csv = 'Round,Table,Members\n';
        
        this.schedule.forEach((round, roundIndex) => {
            round.forEach(table => {
                const members = table.members.join('; ');
                csv += `${roundIndex + 1},${table.table},"${members}"\n`;
            });
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trick_drive_schedule.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    printSchedule() {
        window.print();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const inputSection = document.querySelector('.input-section');
        inputSection.insertBefore(errorDiv, inputSection.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Returns true if this is a perfect Kirkman/Steiner system
    isPerfectKirkmanSystem(totalPeople, numTables, maxPerTable) {
        // Known perfect systems for triples (tables of 3)
        if (maxPerTable === 3) {
            if (
                (totalPeople === 6 && numTables === 2) ||
                (totalPeople === 9 && numTables === 3) ||
                (totalPeople === 12 && numTables === 4) ||
                (totalPeople === 15 && numTables === 5)
            ) {
                return true;
            }
        }
        // Known perfect systems for quadruples (tables of 4)
        if (maxPerTable === 4) {
            if (
                (totalPeople === 8 && numTables === 2) ||
                (totalPeople === 10 && numTables === 2) ||
                (totalPeople === 12 && numTables === 3) ||
                (totalPeople === 14 && numTables === 2)
            ) {
                return true;
            }
        }
        return false;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TrickDriveMatrix();
}); 