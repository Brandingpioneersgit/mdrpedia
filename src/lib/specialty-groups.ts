/**
 * MDRPedia — Specialty Groupings
 * Maps granular specialties to broader categories for rankings display
 */

export interface SpecialtyGroup {
    name: string;
    icon: string;
    description: string;
    specialties: string[];
}

export const SPECIALTY_GROUPS: SpecialtyGroup[] = [
    {
        name: 'Surgery',
        icon: '🔪',
        description: 'All surgical specialties including cardiac, neuro, transplant, and general surgery',
        specialties: [
            'surgery', 'cardiac surgery', 'cardiothoracic surgery', 'neurosurgery',
            'orthopedic surgery', 'transplant surgery', 'vascular surgery',
            'plastic surgery', 'general surgery', 'pediatric surgery',
            'thoracic surgery', 'bariatric surgery', 'oncologic surgery',
            'trauma surgery', 'surgical oncology', 'hepatobiliary surgery',
            'colorectal surgery', 'hand surgery', 'breast surgery',
            'endocrine surgery', 'robotic surgery', 'minimally invasive surgery'
        ]
    },
    {
        name: 'Internal Medicine',
        icon: '🩺',
        description: 'Internal medicine and its subspecialties',
        specialties: [
            'internal medicine', 'medicine', 'general medicine',
            'gastroenterology', 'pulmonology', 'nephrology',
            'endocrinology', 'rheumatology', 'hepatology',
            'geriatrics', 'hospitalist', 'critical care medicine',
            'intensive care', 'icu', 'allergy and immunology'
        ]
    },
    {
        name: 'Cardiology',
        icon: '❤️',
        description: 'Heart and cardiovascular medicine',
        specialties: [
            'cardiology', 'cardiovascular medicine', 'interventional cardiology',
            'electrophysiology', 'cardiac electrophysiology', 'heart failure',
            'preventive cardiology', 'cardiac imaging', 'echocardiography'
        ]
    },
    {
        name: 'Oncology',
        icon: '🎗️',
        description: 'Cancer treatment and research',
        specialties: [
            'oncology', 'medical oncology', 'radiation oncology',
            'hematology-oncology', 'hematology', 'pediatric oncology',
            'neuro-oncology', 'gynecologic oncology', 'cancer research',
            'immunotherapy', 'cancer biology'
        ]
    },
    {
        name: 'Neuroscience',
        icon: '🧠',
        description: 'Brain, spine, and nervous system specialists',
        specialties: [
            'neurology', 'neuroscience', 'neurosurgery', 'neuroradiology',
            'neuropsychiatry', 'movement disorders', 'epilepsy',
            'stroke', 'neuroimmunology', 'behavioral neurology',
            'pediatric neurology', 'sleep medicine', 'headache medicine'
        ]
    },
    {
        name: 'Pediatrics',
        icon: '👶',
        description: 'Child and adolescent medicine',
        specialties: [
            'pediatrics', 'pediatric surgery', 'pediatric cardiology',
            'pediatric oncology', 'pediatric neurology', 'neonatology',
            'pediatric intensive care', 'adolescent medicine',
            'pediatric gastroenterology', 'pediatric pulmonology'
        ]
    },
    {
        name: 'Women\'s Health',
        icon: '👩‍⚕️',
        description: 'Obstetrics, gynecology, and reproductive medicine',
        specialties: [
            'obstetrics', 'gynecology', 'obstetrics and gynecology', 'ob-gyn',
            'maternal-fetal medicine', 'reproductive endocrinology',
            'fertility', 'urogynecology', 'gynecologic oncology'
        ]
    },
    {
        name: 'Orthopedics & Sports',
        icon: '🦴',
        description: 'Musculoskeletal and sports medicine',
        specialties: [
            'orthopedics', 'orthopedic surgery', 'sports medicine',
            'spine surgery', 'joint replacement', 'trauma orthopedics',
            'pediatric orthopedics', 'hand surgery', 'foot and ankle',
            'shoulder surgery', 'physical medicine', 'rehabilitation'
        ]
    },
    {
        name: 'Psychiatry & Mental Health',
        icon: '🧘',
        description: 'Mental health and behavioral medicine',
        specialties: [
            'psychiatry', 'psychology', 'child psychiatry', 'addiction psychiatry',
            'forensic psychiatry', 'geriatric psychiatry', 'neuropsychiatry',
            'consultation-liaison psychiatry', 'psychosomatic medicine'
        ]
    },
    {
        name: 'Radiology & Imaging',
        icon: '📷',
        description: 'Medical imaging and interventional radiology',
        specialties: [
            'radiology', 'interventional radiology', 'neuroradiology',
            'nuclear medicine', 'diagnostic radiology', 'pediatric radiology',
            'breast imaging', 'musculoskeletal radiology'
        ]
    },
    {
        name: 'Emergency & Critical Care',
        icon: '🚑',
        description: 'Emergency medicine and intensive care',
        specialties: [
            'emergency medicine', 'critical care', 'intensive care',
            'trauma', 'disaster medicine', 'toxicology',
            'pediatric emergency medicine'
        ]
    },
    {
        name: 'Infectious Disease & Public Health',
        icon: '🦠',
        description: 'Infectious diseases and global health',
        specialties: [
            'infectious disease', 'infectious diseases', 'epidemiology',
            'public health', 'global health', 'tropical medicine',
            'hiv medicine', 'virology', 'microbiology', 'immunology'
        ]
    },
    {
        name: 'Ophthalmology & Vision',
        icon: '👁️',
        description: 'Eye care and vision science',
        specialties: [
            'ophthalmology', 'retina', 'glaucoma', 'cornea',
            'oculoplastics', 'neuro-ophthalmology', 'pediatric ophthalmology',
            'refractive surgery', 'cataract surgery'
        ]
    },
    {
        name: 'ENT & Head/Neck',
        icon: '👂',
        description: 'Ear, nose, throat and head/neck surgery',
        specialties: [
            'otolaryngology', 'ent', 'ear nose throat', 'head and neck surgery',
            'otology', 'rhinology', 'laryngology', 'facial plastic surgery'
        ]
    },
    {
        name: 'Dermatology',
        icon: '🧴',
        description: 'Skin, hair, and nail disorders',
        specialties: [
            'dermatology', 'dermatologic surgery', 'mohs surgery',
            'cosmetic dermatology', 'pediatric dermatology'
        ]
    },
    {
        name: 'Urology',
        icon: '🏥',
        description: 'Urinary tract and male reproductive health',
        specialties: [
            'urology', 'urologic oncology', 'pediatric urology',
            'female urology', 'andrology', 'kidney transplant'
        ]
    },
    {
        name: 'Pathology & Laboratory',
        icon: '🔬',
        description: 'Diagnostic pathology and laboratory medicine',
        specialties: [
            'pathology', 'anatomic pathology', 'clinical pathology',
            'surgical pathology', 'neuropathology', 'dermatopathology',
            'cytopathology', 'molecular pathology', 'hematopathology'
        ]
    },
    {
        name: 'Anesthesiology & Pain',
        icon: '💉',
        description: 'Anesthesia and pain management',
        specialties: [
            'anesthesiology', 'pain medicine', 'pain management',
            'cardiac anesthesia', 'pediatric anesthesia', 'regional anesthesia'
        ]
    }
];

/**
 * Find the specialty group for a given specialty name
 */
export function getSpecialtyGroup(specialty: string): SpecialtyGroup | null {
    const normalizedSpecialty = specialty.toLowerCase().trim();

    for (const group of SPECIALTY_GROUPS) {
        if (group.specialties.some(s =>
            normalizedSpecialty.includes(s) || s.includes(normalizedSpecialty)
        )) {
            return group;
        }
    }

    return null;
}

/**
 * Get group name for a specialty, with fallback
 */
export function getGroupName(specialty: string): string {
    const group = getSpecialtyGroup(specialty);
    return group?.name || 'Other Specialties';
}

/**
 * Group doctors by specialty group
 */
export function groupBySpecialtyGroup<T extends { specialty: string }>(
    doctors: T[]
): Record<string, T[]> {
    const grouped: Record<string, T[]> = {};

    for (const doctor of doctors) {
        const groupName = getGroupName(doctor.specialty);
        if (!grouped[groupName]) {
            grouped[groupName] = [];
        }
        grouped[groupName].push(doctor);
    }

    return grouped;
}
