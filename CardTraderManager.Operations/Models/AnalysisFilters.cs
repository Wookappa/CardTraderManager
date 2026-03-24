namespace CardTraderManager.Operations.Models;

/// <summary>
/// Filters applied to inventory items before price analysis.
/// Used only from the frontend; automated runs (Console/Functions) pass null to analyze all items.
/// </summary>
public class AnalysisFilters
{
	/// <summary>Minimum current price in euros. Items below this price are excluded.</summary>
	public decimal? MinPrice { get; set; }

	/// <summary>Maximum current price in euros. Items above this price are excluded.</summary>
	public decimal? MaxPrice { get; set; }

	/// <summary>Card name search (case-insensitive contains match).</summary>
	public string? CardName { get; set; }

	/// <summary>Filter by conditions (e.g. "Near Mint", "Slightly Played"). If empty, all conditions included.</summary>
	public List<string>? Conditions { get; set; }

	/// <summary>Filter by expansion IDs. If empty, all expansions included.</summary>
	public List<int>? ExpansionIds { get; set; }

	/// <summary>If true, only foil cards. If false, only non-foil. If null, both.</summary>
	public bool? IsFoil { get; set; }

	public bool HasAnyFilter =>
		MinPrice.HasValue || MaxPrice.HasValue ||
		!string.IsNullOrWhiteSpace(CardName) ||
		(Conditions != null && Conditions.Count > 0) ||
		(ExpansionIds != null && ExpansionIds.Count > 0) ||
		IsFoil.HasValue;
}
