export default function ContractType({type}) {
    return <span className="dimmed condensed">
        {resolveTitle(type)}
    </span>
}

function resolveTitle(type) {
    switch (type) {
        case 'subscriptions':
            return 'Subscriptions'
        case 'dao':
            return 'DAO'
        case 'oracle_beam':
            return 'BeamOracle'
        default:
            return 'PulseOracle'
    }
}