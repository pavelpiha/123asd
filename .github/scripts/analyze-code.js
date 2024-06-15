const USER = process.env.USER;
const TOKEN = process.env.GIT_PAT;

async function main() {
  try {
    console.log(`---------1111111 ------${USER}--------`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
