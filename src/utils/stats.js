/**
 * Calcula los Récords Personales (PB) para un ejercicio dado.
 * Clasifica los PBs en tres categorías:
 * - Fuerza: 1-5 repeticiones
 * - Hipertrofia: 6-12 repeticiones
 * - Resistencia: 12+ repeticiones
 * 
 * @param {Array} logs - Array de objetos log { weight, reps, date, ... }
 * @returns {Object} - Objeto con los PBs { low: {weight, reps, date}, mid: {...}, high: {...} }
 */
export const calculatePersonalBests = (logs) => {
    if (!logs || logs.length === 0) return null;

    const pbs = {
        low: { weight: 0, reps: 0, date: null }, // 1-5 reps
        mid: { weight: 0, reps: 0, date: null }, // 6-12 reps
        high: { weight: 0, reps: 0, date: null } // 12+ reps
    };

    logs.forEach(log => {
        const weight = parseFloat(log.weight);
        const reps = parseInt(log.reps);
        
        if (isNaN(weight) || isNaN(reps)) return;

        // Categorizar por rango de repeticiones
        let category = null;
        if (reps >= 1 && reps <= 5) category = 'low';
        else if (reps >= 6 && reps <= 12) category = 'mid';
        else if (reps > 12) category = 'high';

        if (category) {
            // Verificar si es un nuevo récord de peso
            // Si el peso es mayor, es PB.
            // Si el peso es igual, pero las reps son mayores, también es PB (mejora en volumen con misma carga).
            const currentBest = pbs[category];
            
            if (weight > currentBest.weight || (weight === currentBest.weight && reps > currentBest.reps)) {
                pbs[category] = {
                    weight,
                    reps,
                    date: log.date
                };
            }
        }
    });

    // Limpiar categorías vacías
    Object.keys(pbs).forEach(key => {
        if (pbs[key].weight === 0) delete pbs[key];
    });

    return Object.keys(pbs).length > 0 ? pbs : null;
};

/**
 * Verifica si un nuevo set es un Récord Personal.
 * 
 * @param {Object} newSet - { weight, reps }
 * @param {Object} currentPbs - Objeto de PBs retornado por calculatePersonalBests
 * @returns {Boolean} - True si es un nuevo récord
 */
export const isNewRecord = (newSet, currentPbs) => {
    if (!currentPbs) return true; // Si no hay historia, es récord

    const weight = parseFloat(newSet.weight);
    const reps = parseInt(newSet.reps);
    
    let category = null;
    if (reps >= 1 && reps <= 5) category = 'low';
    else if (reps >= 6 && reps <= 12) category = 'mid';
    else if (reps > 12) category = 'high';

    if (!category) return false;

    const currentBest = currentPbs[category];
    
    // Si no hay récord en esta categoría, es nuevo récord
    if (!currentBest) return true;

    // Comparar
    if (weight > currentBest.weight) return true;
    if (weight === currentBest.weight && reps > currentBest.reps) return true;

    return false;
};

/**
 * Calcula estadísticas semanales para el reporte de IA.
 * 
 * @param {Object} logs - Objeto de logs { exerciseName: [logs] }
 * @param {Object} routineData - Datos de rutina para mapear ejercicios a músculos
 * @returns {Object} - Estadísticas semanales { daysTrained, totalVolume, musclesWorked, previousWeekVolume }
 */
export const getWeeklyStats = (logs, routineData) => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    let daysTrained = new Set();
    let totalVolume = 0;
    let previousWeekVolume = 0;
    let musclesWorked = new Set();

    // Mapa auxiliar ejercicio -> musculo
    const exerciseToMuscle = {};
    if (routineData) {
        Object.values(routineData).forEach(day => {
            if (day.blocks) {
                day.blocks.forEach(block => {
                    block.exercises.forEach(ex => {
                        exerciseToMuscle[ex.name] = ex.muscleGroup || "Otros";
                    });
                });
            }
        });
    }

    Object.entries(logs).forEach(([exName, exLogs]) => {
        exLogs.forEach(log => {
            const logDate = new Date(log.date);
            const volume = log.weight * log.reps * log.sets;

            if (logDate >= oneWeekAgo) {
                // Esta semana
                daysTrained.add(logDate.toDateString());
                totalVolume += volume;
                if (exerciseToMuscle[exName]) {
                    musclesWorked.add(exerciseToMuscle[exName]);
                }
            } else if (logDate >= twoWeeksAgo && logDate < oneWeekAgo) {
                // Semana anterior
                previousWeekVolume += volume;
            }
        });
    });

    return {
        daysTrained: daysTrained.size,
        totalVolume,
        previousWeekVolume,
        musclesWorked: Array.from(musclesWorked)
    };
};
