import { validateRepository } from '../src/lib/validate';

const errors = validateRepository();
if (errors.length > 0) {
	console.error(errors.map((error) => `- ${error}`).join('\n'));
	process.exit(1);
}

console.log('Validasi konten lulus.');
