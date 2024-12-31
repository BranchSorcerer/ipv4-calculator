document.getElementById("calculateBtn").addEventListener("click", calculate);

document.getElementById("ipInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        calculate();
    }
});

function calculate() {
    const input = document.getElementById("ipInput").value.trim();
    const resultDiv = document.getElementById("result");

    if (!input) {
        resultDiv.innerHTML = "<p style='color:red;'>Please enter a valid IP address and netmask.</p>";
        return;
    }

    // Parse input
    let ip, cidr, netmask;
    if (input.includes("/")) {
        [ip, cidr] = input.split("/");
        netmask = cidrToNetmask(parseInt(cidr));
    } else {
        [ip, netmask] = input.split(" ");
        cidr = netmaskToCidr(netmask);
    }

    const ipDetails = calculateIPDetails(ip, cidr, netmask);

    if (!ipDetails) {
        resultDiv.innerHTML = "<p style='color:red;'>Invalid input. Please check your IP address and netmask.</p>";
        return;
    }

    // Generate the result table
    resultDiv.innerHTML = `
        <table>
            <tr><th>IP Address</th><td>${ipDetails.ip}</td></tr>
            <tr><th>Subnet Mask</th><td>${ipDetails.netmask}</td></tr>
            <tr><th>Wildcard Mask</th><td>${ipDetails.wildcardMask}</td></tr>
            <tr><th>IP Class</th><td>${ipDetails.ipClass}</td></tr>
            <tr><th>CIDR Notation</th><td>${ipDetails.cidr}</td></tr>
            <tr><th>IP Type</th><td>${ipDetails.ipType}</td></tr>
            <tr><th>Network Address</th><td>${ipDetails.networkAddress}</td></tr>
            <tr><th>Usable Host IP Range</th><td>${ipDetails.hostRange}</td></tr>
            <tr><th>Broadcast Address</th><td>${ipDetails.broadcastAddress}</td></tr>
            <tr><th>Total Number of Hosts</th><td>${ipDetails.totalHosts}</td></tr>
            <tr><th>Number of Usable Hosts</th><td>${ipDetails.usableHosts}</td></tr>
            <tr><th>HostMin</th><td>${ipDetails.hostMin}</td></tr>
            <tr><th>HostMax</th><td>${ipDetails.hostMax}</td></tr>
        </table>
    `;
}

// Utility functions
function cidrToNetmask(cidr) {
    return Array(4)
        .fill(0)
        .map((_, i) => (cidr - i * 8 > 8 ? 255 : Math.max(0, 256 - 2 ** (8 - (cidr - i * 8)))))
        .join(".");
}

function netmaskToCidr(netmask) {
    return netmask.split(".").reduce((acc, octet) => acc + parseInt(octet).toString(2).replace(/0/g, "").length, 0);
}

function calculateIPDetails(ip, cidr, netmask) {
    try {
        const [ip1, ip2, ip3, ip4] = ip.split(".").map(Number);
        const subnet = parseInt(cidr);

        // Correct IP Class determination
        let ipClass = "";
        if (ip1 >= 1 && ip1 <= 126) ipClass = "A"; // Class A: 1.0.0.0 to 126.0.0.0
        else if (ip1 >= 128 && ip1 <= 191) ipClass = "B"; // Class B: 128.0.0.0 to 191.255.0.0
        else if (ip1 >= 192 && ip1 <= 223) ipClass = "C"; // Class C: 192.0.0.0 to 223.255.255.0
        else if (ip1 >= 224 && ip1 <= 239) ipClass = "D (Multicast)"; // Class D: 224.0.0.0 to 239.255.255.255
        else if (ip1 >= 240 && ip1 <= 255) ipClass = "E (Reserved)"; // Class E: 240.0.0.0 to 255.255.255.255

        // Calculate network details
        const networkAddress = `${ip1}.${ip2}.${ip3}.0/${cidr}`;
        const broadcastAddress = `${ip1}.${ip2}.${ip3}.255`;
        const hostMin = `${ip1}.${ip2}.${ip3}.1`;
        const hostMax = `${ip1}.${ip2}.${ip3}.254`;

        return {
            ip,
            netmask,
            wildcardMask: netmask.split(".").map((x) => 255 - parseInt(x)).join("."),
            ipClass,
            cidr: `/${cidr}`,
            ipType: isPrivateIP(ip1) ? "Private" : "Public",
            networkAddress,
            hostRange: `${hostMin} - ${hostMax}`,
            broadcastAddress,
            totalHosts: 2 ** (32 - subnet),
            usableHosts: 2 ** (32 - subnet) - 2,
            hostMin,
            hostMax,
        };
    } catch (err) {
        return null;
    }
}

function isPrivateIP(ip1) {
    // Check for private IP ranges
    if (
        (ip1 === 10) || // 10.0.0.0 - 10.255.255.255
        (ip1 === 172) || // 172.16.0.0 - 172.31.255.255
        (ip1 === 192) // 192.168.0.0 - 192.168.255.255
    ) {
        return true;
    }
    return false;
}


