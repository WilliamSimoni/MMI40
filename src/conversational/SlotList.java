package conversational;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;

public class SlotList extends Element {
	
	Props slots;
	

	public SlotList(String id) {
		super(id);
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(Slot.class);
		this.slots=new Props(IdGenerator.getNextIdProps(), type, true, true, -1);
		this.props.put("slots",slots);
	}

}
