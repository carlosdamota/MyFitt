export const routineData = {
    day1: { 
        title: "Día 1: Empuje Pesado", 
        focus: "Pecho, Hombro, Tríceps", 
        mode: "heavy", 
        weight: "PESADO (~14-16kg)", 
        color: "text-red-400", 
        bg: "bg-red-900/20", 
        border: "border-red-900/50", 
        blocks: [
            { 
                id: "A", 
                rest: 90, 
                exercises: [
                    { name: "Press de Banca Suelo", reps: "3x 15-20", note: "Bajar en 3 seg. Codos a 45º.", svg: "floor_press", muscleGroup: "Pecho" }, 
                    { name: "Flexiones Pies Elevados", reps: "3x Fallo (RIR 1)", note: "Pies sobre silla. Cuerpo recto.", svg: "pushup_feet_elevated", muscleGroup: "Pecho" }
                ] 
            }, 
            { 
                id: "B", 
                rest: 60, 
                exercises: [
                    { name: "Press Hombros Sentado", reps: "3x 6-8", note: "Espalda recta. No arquear lumbar.", svg: "shoulder_press", muscleGroup: "Hombro" }, 
                    { name: "Fondos en Silla", reps: "3x Fallo (RIR 1)", note: "Baja controlado hasta 90º.", svg: "dips", muscleGroup: "Tríceps" }
                ] 
            }
        ] 
    },
    day2: { 
        title: "Día 2: Tirón Pesado", 
        focus: "Espalda, Bíceps", 
        mode: "heavy", 
        weight: "PESADO (~14-16kg)", 
        color: "text-red-400", 
        bg: "bg-red-900/20", 
        border: "border-red-900/50", 
        blocks: [
            { 
                id: "A", 
                rest: 90, 
                exercises: [
                    { name: "Dominadas Comando", reps: "3x Fallo (RIR 1)", note: "Agarre neutro. Negativa 5 seg.", svg: "pullup", muscleGroup: "Espalda" }, 
                    { name: "Remo Unilateral", reps: "3x 12-15/lado", note: "Mano en apoyo. Espalda plana.", svg: "one_arm_row", muscleGroup: "Espalda" }
                ] 
            }, 
            { 
                id: "B", 
                rest: 60, 
                exercises: [
                    { name: "Remo Bilateral", reps: "3x 15-20", note: "Inclínate 45º. Saca pecho.", svg: "bent_over_row", muscleGroup: "Espalda" }, 
                    { name: "Curl Martillo", reps: "3x 12-15", note: "Agarre neutro. Codos fijos.", svg: "hammer_curl", muscleGroup: "Bíceps" }
                ] 
            }
        ] 
    },
    day3: { 
        title: "Día 3: Piernas Pesado", 
        focus: "Cuádriceps, Femoral, Glúteo", 
        mode: "heavy", 
        weight: "PESADO (~14-16kg)", 
        color: "text-red-400", 
        bg: "bg-red-900/20", 
        border: "border-red-900/50", 
        blocks: [
            { 
                id: "A", 
                rest: 90, 
                exercises: [
                    { name: "Zancada Búlgara", reps: "3x 10-12/lado", note: "Pie trasero elevado. Baja profundo.", svg: "bulgarian_split", muscleGroup: "Pierna" }, 
                    { name: "Peso Muerto Rumano Unilat.", reps: "3x 12-15/lado", note: "Cadera atrás. Rodilla semi-rígida.", svg: "rdl", muscleGroup: "Pierna" }
                ] 
            }, 
            { 
                id: "B", 
                rest: 60, 
                exercises: [
                    { name: "Sentadilla Lateral (2 mancuernas)", reps: "3x 20+", note: "Pies ancho hombros. Mira al frente.", svg: "side_squat", muscleGroup: "Pierna" }, 
                    { name: "Elevación de Piernas", reps: "3x 15-20", note: "Controla la bajada. No balancees.", svg: "leg_raise", muscleGroup: "Core" }
                ] 
            }
        ] 
    },
    day4: { 
        title: "Día 4: Empuje Ligero", 
        focus: "Hombro Aislamiento, Pecho", 
        mode: "light", 
        weight: "LIGERO (~6-8kg)", 
        color: "text-green-400", 
        bg: "bg-green-900/20", 
        border: "border-green-900/50", 
        blocks: [
            { 
                id: "A", 
                rest: 60, 
                exercises: [
                    { name: "Pike Push-ups", reps: "3x Fallo (RIR 1)", note: "Forma de V invertida.", svg: "pike_pushup", muscleGroup: "Hombro" }, 
                    { name: "Aperturas en Suelo", reps: "3x 15-20", note: "Brazos semi-flexionados. Estira.", svg: "flys", muscleGroup: "Pecho" }
                ] 
            }, 
            { 
                id: "B", 
                rest: 60, 
                exercises: [
                    { name: "Elevaciones Laterales", reps: "3x 15-20", note: "Sube hasta altura hombros.", svg: "lateral_raise", muscleGroup: "Hombro" }, 
                    { name: "Extensión Tríceps Unilat.", reps: "3x 15-20", note: "Codo apuntando al techo.", svg: "tricep_extension", muscleGroup: "Tríceps" }
                ] 
            }
        ] 
    },
    day5: { 
        title: "Día 5: Tirón Ligero", 
        focus: "Bíceps, Hombro Posterior", 
        mode: "light", 
        weight: "LIGERO (~6-8kg)", 
        color: "text-green-400", 
        bg: "bg-green-900/20", 
        border: "border-green-900/50", 
        blocks: [
            { 
                id: "A", 
                rest: 60, 
                exercises: [
                    { name: "Dominadas Supinas", reps: "3x Fallo", note: "Palmas hacia ti. Negativa lenta.", svg: "pullup", muscleGroup: "Espalda" }, 
                    { name: "Remo Pájaro", reps: "3x 20+", note: "Inclínate. Abre brazos como alas.", svg: "rear_delt_fly", muscleGroup: "Hombro" }
                ] 
            }, 
            { 
                id: "B", 
                rest: 60, 
                exercises: [
                    { name: "Curl de Bíceps", reps: "3x 15-20", note: "Gira muñeca al subir (supinación).", svg: "bicep_curl", muscleGroup: "Bíceps" }, 
                    { name: "Face Pulls", reps: "3x 20+", note: "Tira hacia la frente. Codos arriba.", svg: "face_pull", muscleGroup: "Hombro" }
                ] 
            }
        ] 
    }
};
