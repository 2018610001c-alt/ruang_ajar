/*
 * Katalog kelas, program/konsentrasi, dan mata pelajaran.
 * Dirangkum dari BAB III KSP SMKN 3 Padang 2026/2027 yang dilampirkan pengguna.
 * Materi e-modul utama tetap bersifat umum tentang penggunaan Canva.
 */
window.RUANG_AJAR_DATA = (() => {
  const programs = {
    X: [
      'Teknik Jaringan Komputer dan Telekomunikasi',
      'Pemasaran',
      'Manajemen Perkantoran dan Layanan Bisnis',
      'Akuntansi dan Keuangan Lembaga',
      'Perhotelan',
      'Kuliner'
    ],
    XI: [
      'Teknik Komputer dan Jaringan',
      'Bisnis Ritel dan Bisnis Digital',
      'Manajemen Perkantoran',
      'Akuntansi',
      'Perhotelan',
      'Kuliner'
    ],
    XII: [
      'Teknik Komputer dan Jaringan',
      'Bisnis Ritel dan Bisnis Digital',
      'Manajemen Perkantoran',
      'Akuntansi',
      'Perhotelan',
      'Kuliner'
    ]
  };

  const generalSubjects = {
    X: [
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Pendidikan Jasmani, Olahraga dan Kesehatan',
      'Sejarah',
      'Seni Tari'
    ],
    XI: [
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia',
      'Pendidikan Jasmani, Olahraga dan Kesehatan',
      'Sejarah'
    ],
    XII: [
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Pendidikan Pancasila',
      'Bahasa Indonesia'
    ]
  };

  const vocationalSubjectsX = {
    'Teknik Jaringan Komputer dan Telekomunikasi': 'Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi',
    'Pemasaran': 'Dasar-Dasar Pemasaran',
    'Manajemen Perkantoran dan Layanan Bisnis': 'Dasar-Dasar Manajemen Perkantoran dan Layanan Bisnis',
    'Akuntansi dan Keuangan Lembaga': 'Dasar-Dasar Akuntansi dan Keuangan Lembaga',
    'Perhotelan': 'Dasar-Dasar Perhotelan',
    'Kuliner': 'Dasar-Dasar Kuliner'
  };

  const concentrationSubjects = {
    'Teknik Komputer dan Jaringan': 'Konsentrasi Keahlian Teknik Komputer dan Jaringan',
    'Bisnis Ritel dan Bisnis Digital': 'Konsentrasi Keahlian Bisnis Ritel dan Bisnis Digital',
    'Manajemen Perkantoran': 'Konsentrasi Keahlian Manajemen Perkantoran',
    'Akuntansi': 'Konsentrasi Keahlian Akuntansi',
    'Perhotelan': 'Konsentrasi Keahlian Perhotelan',
    'Kuliner': 'Konsentrasi Keahlian Kuliner'
  };

  function getSubjects(grade, program) {
    if (!programs[grade]?.includes(program)) return [];
    if (grade === 'X') {
      return [
        ...generalSubjects.X,
        'Matematika',
        'Bahasa Inggris',
        'Informatika',
        'Projek Ilmu Pengetahuan Alam dan Sosial',
        vocationalSubjectsX[program],
        'Koding dan Kecerdasan Artifisial',
        'Muatan Lokal Keminangkabauan'
      ].filter(Boolean);
    }

    if (grade === 'XI') {
      const elective = (program === 'Perhotelan' || program === 'Kuliner')
        ? 'Mata Pelajaran Pilihan (Bahasa Jepang)'
        : 'Mata Pelajaran Pilihan';
      return [
        ...generalSubjects.XI,
        'Matematika',
        'Bahasa Inggris',
        concentrationSubjects[program],
        'Kreativitas, Inovasi, dan Kewirausahaan',
        elective,
        'Muatan Lokal Keminangkabauan'
      ].filter(Boolean);
    }

    if (grade === 'XII') {
      return [
        ...generalSubjects.XII,
        'Matematika',
        'Bahasa Inggris',
        concentrationSubjects[program],
        'Kreativitas, Inovasi, dan Kewirausahaan',
        'Praktik Kerja Lapangan',
        'Mata Pelajaran Pilihan',
        'Muatan Lokal Keminangkabauan'
      ].filter(Boolean);
    }
    return [];
  }

  return { programs, getSubjects };
})();
