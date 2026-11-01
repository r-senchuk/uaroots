import Foundation
import Security
let service = "uaroute-bing-mcp"
let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: "oauth"]
let mode = CommandLine.arguments.last!
if mode == "get" {
    var q = query
    q[kSecReturnData as String] = true
    q[kSecMatchLimit as String] = kSecMatchLimitOne
    var result: CFTypeRef?
    let status = SecItemCopyMatching(q as CFDictionary, &result)
    guard status == errSecSuccess, let data = result as? Data else { exit(2) }
    FileHandle.standardOutput.write(data)
} else if mode == "set" {
    let data = FileHandle.standardInput.readDataToEndOfFile()
    guard data.count < 65536, (try? JSONSerialization.jsonObject(with: data)) != nil else { exit(3) }
    let update = [kSecValueData as String: data]
    var status = SecItemUpdate(query as CFDictionary, update as CFDictionary)
    if status == errSecItemNotFound {
        var q = query
        q[kSecValueData as String] = data
        q[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        status = SecItemAdd(q as CFDictionary, nil)
    }
    guard status == errSecSuccess else { exit(2) }
} else { exit(3) }
