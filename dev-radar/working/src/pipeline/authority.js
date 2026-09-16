const severity = { removed: 4, breaking: 3, deprecated: 2, changed: 1 };
const authority = { official: 2,community: 1 };



export function resolveContradiction(claims) {
    return [...claims].sort((a, b) => {
        const authorityDiff =
            (authority[b.authority] || 0) -
            (authority[a.authority] || 0);

        if (authorityDiff !== 0) {
            return authorityDiff;
        }

        return (
            (severity[b.claimType] || 0) -
            (severity[a.claimType] || 0)
        );
    })[0] || null;
}


