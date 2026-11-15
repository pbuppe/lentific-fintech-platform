// Change le mot de passe d'un compte (ex. le Super Admin) sans jamais
// l'afficher : saisie masquée dans le terminal, seul le hachage bcrypt est
// enregistré. Toutes les sessions ouvertes de ce compte sont fermées.
//
// Utilisation (depuis packages/database) :
//   node --env-file=.env scripts/set-password.mjs superadmin@lentific.com
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Indique l'e-mail du compte : node --env-file=.env scripts/set-password.mjs <email>");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") {
          process.stdout.write("\nAnnulé.\n");
          process.exit(1);
        }
        if (ch === "\u007f" || ch === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        value += ch;
        process.stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (!user) {
    console.error(`Aucun compte trouvé pour ${email}.`);
    process.exit(1);
  }
  console.log(`Compte : ${email} (${user.role})`);

  const pwd = await askHidden("Nouveau mot de passe (10 caractères minimum) : ");
  if (pwd.length < 10) {
    console.error("Trop court : 10 caractères minimum. Rien n'a été changé.");
    process.exit(1);
  }
  if (pwd === "Demo1234!") {
    console.error("C'est l'ancien mot de passe de démo. Rien n'a été changé.");
    process.exit(1);
  }
  const confirm = await askHidden("Retape-le pour confirmer : ");
  if (confirm !== pwd) {
    console.error("Les deux saisies ne sont pas identiques. Rien n'a été changé.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(pwd, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  const closed = await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`✔ Mot de passe changé. ${closed.count} session(s) ouverte(s) fermée(s).`);
  console.log("Tu peux fermer ce terminal.");
} finally {
  await prisma.$disconnect();
}
