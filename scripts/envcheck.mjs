const seen = ['GITHUB_TOKEN', 'GH_TOKEN', 'GITLAB_TOKEN'].filter((name) => process.env[name]);
console.log(seen.length ? `token visible: ${seen.join(', ')}` : 'no token');
process.exit(seen.length ? 1 : 0);
